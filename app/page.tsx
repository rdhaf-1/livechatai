"use client";
import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown"; // Import ini
import remarkGfm from "remark-gfm"; // Import ini

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Halo! Saya sudah mendukung format **Markdown**. Mau coba kirim kode atau list?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(input);
      const response = await result.response;
      const aiMessage = { role: "ai", text: response.text() };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", text: "Maaf, terjadi kesalahan pada API." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col h-screen bg-gray-50 text-gray-800">
      {/* Header Tetap Sama */}
      <nav className="p-4 bg-white border-b flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Gemini AI Pro
        </h1>
        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium">Active</span>
      </nav>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[90%] p-4 rounded-2xl shadow-sm ${
                msg.role === "user" 
                ? "bg-blue-600 text-white rounded-tr-none" 
                : "bg-white border border-gray-100 rounded-tl-none text-gray-700"
              }`}>
                {/* Bagian Render Markdown */}
                <article className="prose prose-sm sm:prose-base max-w-none break-words">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Custom styling untuk elemen markdown agar lebih elegan
                      p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                      code: ({node, ...props}) => <code className="bg-gray-200 text-red-500 px-1 rounded" {...props} />,
                      pre: ({node, ...props}) => <pre className="bg-gray-800 text-gray-100 p-3 rounded-lg overflow-x-auto my-2" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </article>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border p-3 rounded-2xl animate-pulse text-gray-400 text-sm italic">
                Gemini sedang berpikir...
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input Area Tetap Sama */}
      <div className="p-4 bg-white border-t">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Tanyakan apa saja..."
            className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition font-medium disabled:bg-blue-300"
          >
            {loading ? "..." : "Kirim"}
          </button>
        </div>
      </div>
    </main>
  );
}
