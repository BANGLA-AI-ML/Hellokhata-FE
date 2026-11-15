import { api } from '@/lib/api-client';
import {
  AI_CONTRACT_VERSION,
  type AiLanguage,
  type AiProposalResponse,
  type PublicAiTextRequest,
} from '@/types/ai-gateway';

const AI_TEXT_MIN_LENGTH = 2;
const AI_TEXT_MAX_LENGTH = 1000;

export async function submitAiTextRequest(
  text: string,
  language: AiLanguage,
): Promise<AiProposalResponse> {
  const normalizedText = text.trim();

  if (
    normalizedText.length < AI_TEXT_MIN_LENGTH ||
    normalizedText.length > AI_TEXT_MAX_LENGTH
  ) {
    throw new Error(
      `AI request text must be between ${AI_TEXT_MIN_LENGTH} and ${AI_TEXT_MAX_LENGTH} characters.`,
    );
  }

  const request: PublicAiTextRequest = {
    contractVersion: AI_CONTRACT_VERSION,
    clientRequestId: globalThis.crypto?.randomUUID?.(),
    input: {
      modality: 'text',
      text: normalizedText,
      language,
    },
  };

  const response = await api.post<AiProposalResponse>('/ai/requests', request);

  if (!response.data) {
    throw new Error('The ERP backend returned an empty AI proposal response.');
  }

  return response.data;
}

export async function transcribeAiAudioRequest(
  audio: Blob,
  language: AiLanguage,
): Promise<string> {
  const isOgg = audio.type.includes('ogg');
  const mimeType = isOgg ? 'audio/ogg' : 'audio/webm';
  const extension = isOgg ? 'ogg' : 'webm';
  const formData = new FormData();
  formData.append('file', new Blob([audio], { type: mimeType }), `voice.${extension}`);
  formData.append('language', language);

  const response = await api.postForm<{ transcript: string }>(
    '/ai/speech-to-text',
    formData,
  );

  if (!response.data?.transcript?.trim()) {
    throw new Error('The AI speech-to-text service returned an empty transcript.');
  }

  return response.data.transcript.trim();
}

export function formatAiProposalText(
  response: AiProposalResponse,
  language: AiLanguage,
): string {
  const isBangla = language === 'bn' || language === 'bn-BD';
  const confidence = Math.round(response.proposal.confidence * 100);
  const missing = response.missingFields.length > 0
    ? response.missingFields.join(', ')
    : isBangla ? 'নেই' : 'None';
  let statusLine: string;
  let safetyLine: string;

  switch (response.status) {
    case 'REJECTED':
      statusLine = isBangla ? 'প্রস্তাব প্রত্যাখ্যাত — এই কাজ অনুমোদিত নয়।' : 'Proposal rejected — this action is not allowed.';
      safetyLine = isBangla
        ? 'কোনো কাজ বা লেনদেন সম্পন্ন হয়নি। এই অনুরোধটি এগিয়ে নেওয়া যাবে না।'
        : 'Nothing has been executed. This request cannot proceed.';
      break;
    case 'NEEDS_CLARIFICATION':
      statusLine = isBangla ? 'আরও তথ্য প্রয়োজন।' : 'Clarification is needed.';
      safetyLine = isBangla
        ? 'কোনো কাজ সম্পন্ন হয়নি। অসম্পূর্ণ তথ্য দিন; ভবিষ্যৎ প্রস্তাবেও অনুমোদিত নিশ্চিতকরণ লাগবে।'
        : 'Nothing has been executed. Provide the missing information; any future proposal still requires authorized confirmation.';
      break;
    case 'PROPOSED':
      statusLine = isBangla ? 'খসড়া প্রস্তাব।' : 'Draft proposal.';
      safetyLine = isBangla
        ? 'শুধু খসড়া — কোনো লেনদেন সম্পন্ন হয়নি। অনুমোদিত নিশ্চিতকরণ আবশ্যক।'
        : 'Draft only — nothing has been executed. Authorized confirmation is required.';
      break;
  }

  return [
    response.proposal.summary,
    '',
    statusLine,
    (isBangla ? 'আত্মবিশ্বাস' : 'Confidence') + ': ' + confidence + '%',
    (isBangla ? 'অসম্পূর্ণ তথ্য' : 'Missing fields') + ': ' + missing,
    '',
    safetyLine,
  ].join('\n');
}
