// Hello Khata OS - Voice AI Component
// Voice-first experience with waveform animation and live transcription

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { Button } from '@/components/ui/premium';
import {
  formatAiProposalText,
  submitAiTextRequest,
  transcribeAiAudioRequest,
} from '@/services/ai.services';
import { AI_UI_ENABLED } from '@/lib/ai/config';
import { 
  Mic, 
  MicOff, 
  X, 
  Copy, 
  Check, 
  RefreshCw,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface VoiceResult {
  id: string;
  query: string;
  answer: string;
  answerBn: string;
  data?: {
    headers: string[];
    rows: (string | number)[][];
  };
  actions: Array<{
    id: string;
    label: string;
    labelBn: string;
  }>;
}

function stopMediaStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

export function VoiceModal({ isOpen, onClose }: VoiceModalProps) {
  const { isBangla } = useAppTranslation();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<VoiceResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const captureActiveRef = useRef(false);
  const captureSessionRef = useRef(0);

  const cancelRecording = useCallback(() => {
    captureSessionRef.current += 1;
    captureActiveRef.current = false;
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      try {
        recorder.stop();
      } catch {
        // The recorder may already have stopped while the modal was closing.
      }
    }
    stopMediaStream(mediaStreamRef.current);
    mediaRecorderRef.current = null;
    mediaStreamRef.current = null;
    audioChunksRef.current = [];
  }, []);

  useEffect(() => {
    if (!isOpen) cancelRecording();
    return cancelRecording;
  }, [isOpen, cancelRecording]);

  const startListening = useCallback(async () => {
    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === 'undefined'
    ) {
      setError('unsupported');
      return;
    }

    setError(null);
    setTranscript('');
    setResult(null);
    const sessionId = captureSessionRef.current + 1;
    captureSessionRef.current = sessionId;
    captureActiveRef.current = true;
    setIsListening(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (captureSessionRef.current !== sessionId || !captureActiveRef.current) {
        stopMediaStream(stream);
        return;
      }

      const mimeOptions = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/ogg',
      ];
      const mime = mimeOptions.find((option) =>
        MediaRecorder.isTypeSupported(option),
      );

      if (!mime) {
        stopMediaStream(stream);
        throw new Error('unsupported');
      }

      mediaStreamRef.current = stream;
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (
          captureSessionRef.current === sessionId &&
          event.data.size > 0
        ) {
          audioChunksRef.current.push(event.data);
        }
      };
      recorder.onerror = () => {
        if (captureSessionRef.current !== sessionId) return;
        captureActiveRef.current = false;
        setIsListening(false);
        setError('recording-failed');
        stopMediaStream(stream);
        mediaRecorderRef.current = null;
        mediaStreamRef.current = null;
      };
      recorder.onstop = () => {
        if (captureSessionRef.current === sessionId) {
          stopMediaStream(stream);
          mediaStreamRef.current = null;
        }
      };
      recorder.start(250);
    } catch (err) {
      if (captureSessionRef.current !== sessionId) return;
      captureActiveRef.current = false;
      setIsListening(false);
      stopMediaStream(mediaStreamRef.current);
      mediaStreamRef.current = null;
      mediaRecorderRef.current = null;
      setError(
        err instanceof Error && err.message === 'unsupported'
          ? 'unsupported'
          : err instanceof DOMException &&
              ['NotAllowedError', 'SecurityError'].includes(err.name)
            ? 'not-allowed'
            : 'recording-failed',
      );
    }
  }, []);

  const stopListening = useCallback(async () => {
    if (!captureActiveRef.current) return;

    const sessionId = captureSessionRef.current;
    const recorder = mediaRecorderRef.current;
    const stream = mediaStreamRef.current;
    if (!recorder || recorder.state === 'inactive') {
      captureActiveRef.current = false;
      setIsListening(false);
      stopMediaStream(stream);
      setError('no-speech');
      return;
    }

    setIsListening(false);
    captureActiveRef.current = false;
    const uploadMimeType = recorder.mimeType.includes('ogg') ? 'audio/ogg' : 'audio/webm';

    const audio = await new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        resolve(new Blob(audioChunksRef.current, { type: uploadMimeType }));
      };
      try {
        recorder.stop();
      } catch {
        resolve(new Blob(audioChunksRef.current, { type: uploadMimeType }));
      }
      stopMediaStream(stream);
    });

    if (captureSessionRef.current !== sessionId) return;
    mediaRecorderRef.current = null;
    mediaStreamRef.current = null;
    audioChunksRef.current = [];

    if (audio.size === 0) {
      setError('no-speech');
      return;
    }

    setIsProcessing(true);
    let transcribed = false;
    try {
      const language = isBangla ? 'bn-BD' : 'en-US';
      const finalTranscript = await transcribeAiAudioRequest(audio, language);
      if (captureSessionRef.current !== sessionId) return;
      setTranscript(finalTranscript);
      transcribed = true;

      const proposal = await submitAiTextRequest(finalTranscript, language);
      if (captureSessionRef.current !== sessionId) return;

      const answer = formatAiProposalText(proposal, language);
      setResult({
        id: Date.now().toString(),
        query: finalTranscript,
        answer,
        answerBn: answer,
        actions: [],
      });
    } catch {
      if (captureSessionRef.current === sessionId) {
        setError(transcribed ? 'processing-failed' : 'transcription-failed');
      }
    } finally {
      if (captureSessionRef.current === sessionId) setIsProcessing(false);
    }
  }, [isBangla]);

  const handleClose = useCallback(() => {
    cancelRecording();
    setIsListening(false);
    setIsProcessing(false);
    setTranscript('');
    setResult(null);
    setError(null);
    onClose();
  }, [cancelRecording, onClose]);

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setTranscript('');
    setResult(null);
    setError(null);
  };

  if (!AI_UI_ENABLED || !isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col min-w-[300px] w-fit max-w-lg mx-4 bg-card border border-border-subtle rounded-2xl shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <Mic className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold text-foreground">
                {isBangla ? 'ভয়েস AI' : 'Voice AI'}
              </span>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Waveform Animation */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                {/* Pulsing background rings */}
                {isListening && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full bg-primary/20"
                      animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full bg-primary/30"
                      animate={{ scale: [1, 1.3], opacity: [0.3, 0] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                    />
                  </>
                )}
                
                {/* Mic button */}
                <motion.button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isProcessing}
                  className={cn(
                    'relative h-20 w-20 rounded-full flex items-center justify-center transition-colors',
                    isListening 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted hover:bg-muted/80 text-foreground'
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  {isListening ? (
                    <MicOff className="h-8 w-8" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                </motion.button>
              </div>

              {/* Waveform visualization */}
              {isListening && (
                <div className="flex items-center gap-1 h-8">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-primary rounded-full"
                      animate={{
                        height: [16, 32, 16],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        delay: i * 0.05,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Status text */}
              <p className="text-sm text-muted-foreground mt-3">
                {isListening 
                  ? (isBangla ? 'রেকর্ড হচ্ছে... ট্রান্সক্রাইব করতে আবার ক্লিক করুন' : 'Recording... Click again to transcribe')
                  : isProcessing
                  ? (isBangla ? 'অডিও ট্রান্সক্রাইব ও বিশ্লেষণ হচ্ছে...' : 'Transcribing and processing audio...')
                  : (isBangla
                    ? 'কথা বলতে মাইক্রোফোন চাপুন, তারপর ট্রান্সক্রাইব করতে আবার চাপুন'
                    : 'Tap the microphone to record, then tap again to transcribe')
                }
              </p>
            </div>

            {/* Transcript */}
            {transcript && !result && (
              <div className="mb-4 p-4 bg-muted/50 rounded-xl border border-border-subtle">
                <p className="text-sm text-foreground">{transcript}</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-4 p-4 bg-destructive/10 rounded-xl border border-destructive/20 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-destructive font-medium">
                    {isBangla ? 'ত্রুটি' : 'Error'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {error === 'not-allowed' 
                      ? (isBangla ? 'মাইক্রোফোন অনুমতি দিন' : 'Please allow microphone access in your browser settings')
                      : error === 'no-speech'
                      ? (isBangla ? 'কোনো কথা শোনা যায়নি। আবার চেষ্টা করুন।' : 'No speech detected. Please try again.')
                      : error === 'unsupported'
                      ? (isBangla ? 'এই ব্রাউজারে অডিও রেকর্ডিং সমর্থিত নয়।' : 'Audio recording is not supported in this browser.')
                      : error === 'recording-failed'
                      ? (isBangla ? 'অডিও রেকর্ড করা যায়নি। মাইক্রোফোন অনুমতি পরীক্ষা করুন।' : 'Audio recording failed. Check microphone access and try again.')
                      : error === 'transcription-failed'
                      ? (isBangla ? 'অডিও ট্রান্সক্রাইব করা যায়নি। এআই সেবা পরীক্ষা করে আবার চেষ্টা করুন।' : 'Could not transcribe the audio. Check the AI service and try again.')
                      : error === 'processing-failed'
                      ? (isBangla ? 'ট্রান্সক্রিপ্ট তৈরি হয়েছে, কিন্তু এআই অনুরোধ সম্পন্ন হয়নি। আবার চেষ্টা করুন।' : 'Audio was transcribed, but the AI request failed. Please try again.')
                      : (isBangla ? 'একটি ত্রুটি হয়েছে। আবার চেষ্টা করুন।' : 'An error occurred. Please try again.')
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Result */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Query */}
                <div className="p-3 bg-muted/50 rounded-xl">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    {isBangla ? 'আপনার প্রশ্ন' : 'Your Query'}
                  </p>
                  <p className="text-sm font-medium text-foreground">{result.query}</p>
                </div>

                {/* Answer */}
                <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium text-primary uppercase tracking-wider">
                        AI Response
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleCopy}
                        className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                        title={isBangla ? 'কপি করুন' : 'Copy'}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-primary" />
                        ) : (
                          <Copy className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                      <button
                        onClick={handleReset}
                        className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                        title={isBangla ? 'নতুন প্রশ্ন করুন' : 'Ask new question'}
                      >
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-foreground">
                    {isBangla ? result.answerBn : result.answer}
                  </p>
                </div>

                {/* Data Table */}
                {result.data && (
                  <div className="rounded-xl border border-border-subtle overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          {result.data.headers.map((header, i) => (
                            <th key={i} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.data.rows.map((row, i) => (
                          <tr key={i} className="border-t border-border-subtle">
                            {row.map((cell, j) => (
                              <td key={j} className="px-3 py-2 text-foreground">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Actions */}
                {result.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {result.actions.map((action) => (
                      <Button key={action.id} variant="outline" size="sm">
                        {isBangla ? action.labelBn : action.label}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Voice Button Component (for top bar)
export function VoiceButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'relative h-10 w-10 rounded-xl flex items-center justify-center',
        'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground',
        'hover:opacity-90 transition-opacity shadow-lg'
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Mic className="h-5 w-5" />
      {/* Subtle pulse animation */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-primary/30"
        animate={{ scale: [1, 1.2], opacity: [0.5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.button>
  );
}

export default VoiceModal;
