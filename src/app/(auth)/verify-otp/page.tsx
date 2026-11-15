"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Lock,
    Loader2,
    Store,
    CheckCircle2,
    ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSessionStore, useUser } from "@/stores/sessionStore";
import {
    useVerifyOTP,
    useResendOTP,
} from "@/hooks/api/useUser";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyOtpContent() {

    const router = useRouter();
    const searchParams = useSearchParams();
    const phone = searchParams.get("phone") || "";

    const [countdown, setCountdown] = useState(60);
    const [otp, setOtp] = useState("");

    const verifyOTP = useVerifyOTP();
    const resendOTP = useResendOTP();
    const { setSessionFromAuthResponse } = useSessionStore();

    const user = useUser();

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const handleVerifyOtp = () => {
        if (!otp || otp.length !== 6) {
            toast.error("Invalid OTP", {
                description: "Please enter the 6-digit OTP",
            });
            return;
        }

        const registrationId = sessionStorage.getItem("pendingSignupRegistrationId") || undefined;

        verifyOTP.mutate(
            { registrationId, code: otp },
            {
                onSuccess: (data) => {
                    if (data.success) {
                        sessionStorage.removeItem("pendingSignupRegistrationId");
                        setSessionFromAuthResponse(data)
                        toast.success(data.message || "OTP verified successfully");
                        router.push("/");
                    } else {
                        toast.error(data.message || "Verification failed");
                    }
                },
                onError: (error: any) => {
                    const errMsg = error.response?.data?.message || "Invalid OTP code";
                    toast.error(errMsg);
                }
            }
        );
    };

    const handleResendOTP = () => {

        const registrationId = sessionStorage.getItem("pendingSignupRegistrationId") || undefined;
        const obj = { registrationId, purpose: "signup" };
        resendOTP.mutate(obj, {
            onSuccess: (data) => {
                if (data.success) {
                    setCountdown(60);
                    toast.success("OTP has been resent successfully!");
                } else {
                    toast.error(data.message || "Failed to resend OTP");
                }
            },
            onError: (error: any) => {
                const errMsg = error.response?.data?.message || "Failed to resend OTP";
                toast.error(errMsg);
            }
        });
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 lg:p-8 relative overflow-hidden">
            {/* Background Elements */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{ backgroundColor: "#0F141B" }}
            >
                <div
                    className="absolute top-0 left-0 w-[600px] h-[500px] opacity-30"
                    style={{
                        background:
                            "radial-gradient(ellipse 80% 60% at 5% 0%, rgba(79, 91, 255, 0.15) 0%, transparent 60%)",
                    }}
                />
                <div
                    className="absolute bottom-0 right-0 w-[500px] h-[400px] opacity-30"
                    style={{
                        background:
                            "radial-gradient(ellipse 60% 50% at 90% 90%, rgba(20, 35, 55, 0.4) 0%, transparent 60%)",
                    }}
                />
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] opacity-20"
                    style={{
                        background:
                            "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(15, 191, 159, 0.08) 0%, transparent 70%)",
                    }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-full md:max-w-2xl lg:max-w-3xl relative z-10"
            >
                {/* Logo */}
                <div className="text-center mb-8 md:mb-10">
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl mb-4 shrink-0 relative"
                        style={{
                            background:
                                "linear-gradient(135deg, #4F5BFF 0%, #6366F1 50%, #0FBF9F 100%)",
                            boxShadow:
                                "0 0 30px rgba(79, 91, 255, 0.3), 0 0 60px rgba(15, 191, 159, 0.15)",
                        }}
                    >
                        <Store className="h-8 w-8 md:h-10 md:w-10 text-white" />
                    </motion.div>
                    <h1
                        className="text-2xl md:text-3xl font-bold text-foreground whitespace-nowrap"
                        style={{ color: "#E6EDF5" }}
                    >
                        Hello Khata
                    </h1>
                    <p
                        className="text-muted-foreground mt-1 text-sm md:text-base whitespace-nowrap"
                        style={{ color: "#9DA7B3" }}
                    >
                        আপনার ব্যবসার ডিজিটাল খাতা
                    </p>
                </div>

                {/* Card */}
                <div
                    className="px-6 py-6 md:px-10 md:py-8 lg:px-12 lg:py-10 rounded-xl w-full flex flex-col relative"
                    style={{
                        background:
                            "linear-gradient(180deg, rgba(35, 46, 60, 1) 0%, rgba(28, 36, 48, 1) 100%)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        boxShadow:
                            "inset 0 1px 0 rgba(255, 255, 255, 0.03), 0 4px 24px rgba(0, 0, 0, 0.25)",
                    }}
                >
                    <div
                        className="absolute inset-0 rounded-xl pointer-events-none"
                        style={{
                            background:
                                "linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, transparent 50%)",
                        }}
                    />

                    <AnimatePresence mode="wait">
                        <motion.form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleVerifyOtp();
                            }}
                            key="otp"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col gap-5 md:gap-6 relative z-10"
                        >
                            <div className="shrink-0">
                                <h2
                                    className="text-xl md:text-2xl font-semibold whitespace-nowrap"
                                    style={{ color: "#E6EDF5" }}
                                >
                                    Verify & Complete Registration
                                </h2>
                                <p
                                    className="text-sm md:text-base mt-1"
                                    style={{ color: "#9DA7B3" }}
                                >
                                    Enter the code sent to{" "}
                                    <span className="font-semibold text-white">{phone || "your phone number"}</span>
                                </p>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label
                                    className="text-sm font-medium whitespace-nowrap shrink-0"
                                    style={{ color: "#E6EDF5" }}
                                >
                                    Verification Code
                                </label>
                                <div className="relative w-full">
                                    <Lock
                                        className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 shrink-0"
                                        style={{ color: "#6B7684" }}
                                    />
                                    <Input
                                        type="text"
                                        placeholder="Enter 6-digit code"
                                        value={otp}
                                        onChange={(e) =>
                                            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                                        }
                                        className="pl-12 text-center tracking-widest w-full h-12 md:h-14 font-mono text-lg md:text-xl"
                                        maxLength={6}
                                        style={{
                                            backgroundColor: "#171F29",
                                            borderColor: "rgba(255, 255, 255, 0.05)",
                                            color: "#E6EDF5",
                                        }}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={verifyOTP.isPending || otp.length !== 6}
                                className="w-full shrink-0 h-12 md:h-14 font-medium text-base"
                                style={{
                                    background:
                                        "linear-gradient(135deg, #4F5BFF 0%, #5E6AFF 100%)",
                                    color: "#FFFFFF",
                                    boxShadow: "0 0 20px rgba(79, 91, 255, 0.25)",
                                }}
                            >
                                {verifyOTP.isPending ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <span className="whitespace-nowrap">
                                            Verify & Complete
                                        </span>
                                        <CheckCircle2 className="ml-2 h-5 w-5 shrink-0" />
                                    </>
                                )}
                            </Button>

                            <div className="flex items-center justify-between shrink-0">
                                <Link href="/register">
                                    <button
                                        type="button"
                                        className="text-sm md:text-base flex items-center gap-1 whitespace-nowrap transition-colors hover:opacity-80 cursor-pointer"
                                        style={{ color: "#9DA7B3" }}
                                    >
                                        <ArrowLeft className="h-4 w-4 shrink-0" /> Back
                                    </button>
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={countdown > 0 || resendOTP.isPending}
                                    className="text-sm md:text-base whitespace-nowrap transition-colors disabled:opacity-50 cursor-pointer"
                                    style={{ color: countdown > 0 ? "#6B7684" : "#4F5BFF" }}
                                >
                                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                                </button>
                            </div>
                        </motion.form>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0F141B" }}>
                <Loader2 className="h-8 w-8 animate-spin text-primary" style={{ color: "#4F5BFF" }} />
            </div>
        }>
            <VerifyOtpContent />
        </Suspense>
    );
}
