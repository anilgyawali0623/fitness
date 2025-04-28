"use client";

import { vapi } from "@/lib/vapi";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

const GeneralProgramPage = () => {
  const [callActive, setCallActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState([]);
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
    const handleMessage = (message: any) => { }
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

          }
        })
      } catch (error) {
        console.log("failed to start call", error);
        setConnecting(false);
      }
    }
  }
  return (
    <div>

    </div>
  )
}

export default GeneralProgramPage
