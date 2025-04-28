"use client";

import { vapi } from "@/lib/vapi";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

const GeneralProgramPage = () => {
  const [callActive, setCallActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [callEnded, setCallEnded] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const messageContainerRef = useRef<HTMLDivElement>(null);

  //  navigate user to profile page after the call ends
  useEffect(() => {
    if (callEnded) {
      const redirectTimer = setTimeout(() => {

        router.push("/profile")
      }, 1500)
      return () => clearTimeout(redirectTimer)

    }
  }, [callEnded, router])


  //  auto scroll message
  useEffect(() => {

    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;

    }

  }, [messages])

  useEffect(() => {
    const handleCallStart = () => {
      setConnecting(false);
      setCallActive(true);
      setCallEnded(false);
    }
    const handleCallEnd = () => {
      setCallActive(false)
      setConnecting(false)
      setIsSpeaking(false);
      setCallEnded(true);
    }
    const handleSpeechStart = () => {
      setIsSpeaking(true);


    }
    const handleSpeechEnd = () => {
      setIsSpeaking(false)
    }
    const handleMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { content: message.transcript, role: message.role }

        setMessages(prev => [...prev, newMessage])
      }


    }
    const handleError = (error: any) => {
      console.log("vapi error");
      setConnecting(false);
      setCallActive(false);



    }

    vapi.on("call-start", handleCallStart)
      .on("call-end", handleCallEnd)
      .on("speech-start", handleSpeechStart)

      .on("speech-end", handleSpeechEnd)
      .on("message", handleMessage)
      .on("error", handleError)

    return () => {
      vapi.off("call-start", handleCallStart)
        .off("call-end", handleCallEnd)
        .off("speech-start", handleSpeechStart)

        .off("speech-end", handleSpeechEnd)
        .off("message", handleMessage)
        .off("error", handleError)
    }

  }, [])

  const toggleCall = async () => {
    if (callActive) vapi.stop()
    else {
      try {
        setConnecting(true);
        setMessages([])
        setCallEnded(false);
        const fullName = user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "there";
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW!, {
          variableValues: {
            full_name: fullName,
            user_id: user?.id
          }
        })
      } catch (error) {
        console.log("failed to start call", error);
        setConnecting(false);
      }
    }
  }
  return (
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden  pb-6 pt-24">
      <div className="container mx-auto px-4 h-full max-w-5xl">

      </div>
    </div>
  )
}

export default GeneralProgramPage
