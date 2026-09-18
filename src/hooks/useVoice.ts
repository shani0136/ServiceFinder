import { useState, useRef, useCallback } from 'react';

interface UseVoiceReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  start: () => void;
  stop: () => void;
  reset: () => void;
  error: string | null;
}

// Web Speech API type shim — not in all TypeScript lib versions
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

/**
 * Hook that wraps the browser Web Speech API for voice input.
 * Returns transcript text that the caller can use to populate the search field.
 * Does NOT auto-submit — user must confirm after speaking.
 */
export function useVoice(onTranscript: (text: string) => void): UseVoiceReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<unknown>(null);

  // Check support once
  const SpeechRecognition =
    (typeof window !== 'undefined' &&
      ((window as unknown as Record<string, unknown>).SpeechRecognition ||
        (window as unknown as Record<string, unknown>).webkitSpeechRecognition)) as
      | (new () => unknown)
      | undefined;

  const isSupported = Boolean(SpeechRecognition);

  const start = useCallback(() => {
    if (!isSupported || !SpeechRecognition) {
      setError('Voice input is not supported in this browser. Please type your request.');
      return;
    }
    if (isListening) return;

    setError(null);
    setTranscript('');

    const recognition = new SpeechRecognition() as {
      lang: string;
      interimResults: boolean;
      maxAlternatives: number;
      onresult: (e: SpeechRecognitionEvent) => void;
      onerror: (e: { error: string }) => void;
      onend: () => void;
      start: () => void;
      stop: () => void;
    };

    recognition.lang = 'hi-IN'; // Hindi + English Hinglish
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(' ')
        .trim();
      setTranscript(text);
      onTranscript(text);
    };

    recognition.onerror = (event: { error: string }) => {
      if (event.error === 'not-allowed') {
        setError('Microphone permission was denied. Please allow microphone access.');
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else {
        setError('Voice input error. Please type your request instead.');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isSupported, isListening, SpeechRecognition, onTranscript]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      (recognitionRef.current as { stop: () => void }).stop();
      setIsListening(false);
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    setTranscript('');
    setError(null);
  }, [stop]);

  return { isListening, isSupported, transcript, start, stop, reset, error };
}
