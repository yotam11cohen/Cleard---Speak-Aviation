export function speakATC(text: string): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = 1.1
  utterance.pitch = 0.85
  utterance.volume = 1

  const voices = window.speechSynthesis.getVoices()
  const preferred = voices.find(v => v.lang === 'en-US' && v.name.includes('Google'))
    ?? voices.find(v => v.lang === 'en-US')
  if (preferred) utterance.voice = preferred

  window.speechSynthesis.speak(utterance)
}

export function cancelSpeech(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}
