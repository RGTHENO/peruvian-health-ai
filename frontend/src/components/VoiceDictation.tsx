import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface VoiceDictationProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

interface VoiceRecognitionAlternative {
  transcript: string;
}

interface VoiceRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: VoiceRecognitionAlternative;
}

interface VoiceRecognitionResultList {
  length: number;
  [index: number]: VoiceRecognitionResult;
}

interface VoiceRecognitionEvent {
  results: VoiceRecognitionResultList;
  resultIndex: number;
}

interface VoiceRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: VoiceRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface VoiceRecognitionWindow extends Window {
  SpeechRecognition?: new () => VoiceRecognitionInstance;
  webkitSpeechRecognition?: new () => VoiceRecognitionInstance;
}

const VoiceDictation = ({ onTranscript, disabled }: VoiceDictationProps) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<VoiceRecognitionInstance | null>(null);
  const supported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const toggle = useCallback(() => {
    if (!supported) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognitionWindow = window as VoiceRecognitionWindow;
    const SpeechRecognition =
      recognitionWindow.SpeechRecognition || recognitionWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "es-PE";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: VoiceRecognitionEvent) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }
      if (transcript) onTranscript(transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, supported, onTranscript]);

  if (!supported) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={isListening ? "destructive" : "outline"}
          size="icon"
          className="h-11 w-11 shrink-0"
          aria-label={isListening ? "Detener dictado por voz" : "Iniciar dictado por voz"}
          onClick={toggle}
          disabled={disabled}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{isListening ? "Detener dictado" : "Dictar por voz"}</TooltipContent>
    </Tooltip>
  );
};

export default VoiceDictation;
