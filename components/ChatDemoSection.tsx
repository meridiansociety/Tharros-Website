"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Client, Key, Agent, type Task } from "@relevanceai/sdk";
import AnimatedSection from "./AnimatedSection";

// Relevance AI Configuration (using environment variables)
const REGION = process.env.NEXT_PUBLIC_RELEVANCE_REGION || "";
const PROJECT = process.env.NEXT_PUBLIC_RELEVANCE_PROJECT || "";
const AGENT_ID = process.env.NEXT_PUBLIC_RELEVANCE_AGENT_ID || "";

type LocalMessage = {
  id: string;
  sender: "user" | "agent";
  text: string;
  time: string;
};

export default function ChatDemoSection() {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [recommendedQuestions, setRecommendedQuestions] = useState<string[]>([]);
  const [agentInstance, setAgentInstance] = useState<Agent | null>(null);
  const [currentTask, setCurrentTask] = useState<Task<any, any> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize Relevance AI Client and Agent
  useEffect(() => {
    async function initRelevance() {
      if (!REGION || !PROJECT || !AGENT_ID) return;
      try {
        const storageKey = `r-${AGENT_ID}`;
        const stored = JSON.parse(localStorage.getItem(storageKey) ?? "null");
        
        let keyInstance;
        if (stored?.embedKey && stored?.conversationPrefix) {
          keyInstance = new Key({
            key: stored.embedKey,
            region: REGION as any,
            project: PROJECT,
            agentId: AGENT_ID,
            taskPrefix: stored.conversationPrefix,
          });
        } else {
          keyInstance = await Key.generateEmbedKey({
            region: REGION as any,
            project: PROJECT,
            agentId: AGENT_ID,
          });
          const { key: embedKey, taskPrefix } = keyInstance.toJSON();
          localStorage.setItem(storageKey, JSON.stringify({ embedKey, conversationPrefix: taskPrefix }));
        }

        const client = new Client(keyInstance);
        const agent = await Agent.get(AGENT_ID, client);
        setAgentInstance(agent);

        // Fetch initial recommended questions from agent config
        const config = (agent as any).config || {};
        const metadata = (agent as any).metadata || {};
        const initialQuestions = 
          config.recommended_questions || 
          metadata.recommended_questions || 
          config.suggested_queries || 
          [];
        
        if (initialQuestions.length > 0) {
          setRecommendedQuestions(initialQuestions);
        }

        // Initial greeting
        setMessages([
          {
            id: "1",
            sender: "agent",
            text: "Hi! I'm your Tharros-powered AI agent. Ask me anything about our services.",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
      } catch (err) {
        console.error("Failed to initialize Relevance AI:", err);
      }
    }

    initRelevance();
  }, []);

  // Listen for messages from the task
  useEffect(() => {
    if (!currentTask) return;

    const handleMessage = ({ detail }: any) => {
      const { message } = detail;
      
      // Handle agent messages
      if (message.type === "agent-message") {
        setMessages((prev) => {
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, {
            id: message.id,
            sender: "agent",
            text: message.text || "...",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }];
        });
        
        // Extract recommended questions if available in the message
        if (message.details?.recommended_questions) {
          setRecommendedQuestions(message.details.recommended_questions);
        } else if (message.recommended_questions) {
          setRecommendedQuestions(message.recommended_questions);
        }
        
        setIsTyping(false);
      }
    };

    currentTask.addEventListener("message", handleMessage);
    return () => {
      currentTask.unsubscribe();
    };
  }, [currentTask]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || !agentInstance || isTyping) return;

    setInputValue("");
    setRecommendedQuestions([]); // Hide while thinking
    
    const userMsgId = Date.now().toString();
    setMessages((prev) => [...prev, {
      id: userMsgId,
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);

    setIsTyping(true);

    try {
      const newTask = await agentInstance.sendMessage(text, (currentTask as any));
      if (newTask !== currentTask) {
        setCurrentTask(newTask);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);
      setMessages((prev) => [...prev, {
        id: "error",
        sender: "agent",
        text: "I encountered an error. Please try again.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
  };

  return (
    <section id="demo" className="py-24 md:py-32 px-6 md:px-12 relative overflow-hidden bg-bg">
      <div className="max-w-6xl mx-auto relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left: Text Content */}
        <AnimatedSection>
          <p className="section-label mb-4">Interactive Agent</p>
          <h2 className="text-3xl md:text-5xl font-bold text-text mb-6 leading-tight">
            Built for <span className="accent-text">Performance</span>
          </h2>
          <p className="text-subdued text-base md:text-lg mb-10 leading-relaxed max-w-xl">
            Experience the precision of our custom-built AI. It understands context, handles objections, and schedules calls, all within your brand&apos;s voice.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-border shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-3">
                <path d="M12 22s8-4.5 8-11.8A8 8 0 0 0 4 10.2c0 7.3 8 11.8 8 11.8z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <p className="text-sm font-medium text-text">Context-aware reasoning & logic</p>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-border shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-3">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <p className="text-sm font-medium text-text">Multilingual support built-in</p>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-border shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-3">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
              <p className="text-sm font-medium text-text">99.9% accurate training data</p>
            </div>
          </div>
        </AnimatedSection>

        {/* Right: Compact Chat UI */}
        <AnimatedSection delay={0.2} variant="scale-in">
          <div className="relative w-full max-w-[440px] mx-auto lg:ml-auto">
            <div className="relative flex flex-col h-[520px] sm:h-[580px] w-full bg-white border border-border shadow-sm overflow-hidden rounded-xl">
              
              {/* Header: Sharp & Functional */}
              <div className="px-6 py-4 flex items-center justify-between border-b border-border bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-text flex items-center justify-center text-white font-bold text-xs">
                    T
                  </div>
                  <div>
                    <h3 className="text-text font-bold text-xs uppercase tracking-widest leading-none">Tharros_Agent</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-1 h-1 rounded-full bg-green-500" />
                      <p className="text-muted text-[9px] font-bold uppercase tracking-wider">System Operational</p>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-muted/60 bg-white border border-border px-2 py-0.5 rounded">
                  v1.2.0
                </div>
              </div>

              {/* Messages Area: Clean & Structured */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 bg-white scroll-smooth"
              >
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: msg.sender === "user" ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex flex-col gap-1.5"
                    >
                      <div className={`flex items-center gap-2 mb-0.5`}>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${msg.sender === "user" ? "text-accent-3" : "text-text"}`}>
                          {msg.sender === "user" ? "Client" : "Agent"}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="text-[9px] text-muted font-mono">{msg.time}</span>
                      </div>
                      <div 
                        className={`text-sm leading-relaxed ${
                          msg.sender === "user" 
                          ? "text-text pl-4 border-l-2 border-accent-3/30" 
                          : "text-subdued pl-4 border-l-2 border-border"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 pl-4 border-l-2 border-border"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Processing</span>
                      <div className="flex gap-0.5">
                        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 bg-muted" />
                        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-muted" />
                        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-muted" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer: Integrated & Geometric */}
              <div className="border-t border-border bg-slate-50/30 p-4">
                
                {/* Recommended Questions: Sharp Tabs */}
                <AnimatePresence>
                  {recommendedQuestions.length > 0 && !isTyping && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="flex flex-wrap gap-2 mb-4"
                    >
                      {recommendedQuestions.map((q) => (
                        <button
                          key={q}
                          onClick={() => handleSend(q)}
                          className="px-3 py-1.5 bg-white border border-border text-[10px] font-bold uppercase tracking-tighter text-subdued hover:border-text hover:text-text transition-all"
                        >
                          {q}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form 
                  onSubmit={(e) => handleSend(inputValue, e)}
                  className="flex bg-white border border-border rounded overflow-hidden focus-within:border-accent-3 transition-all"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter query..."
                    disabled={!agentInstance || isTyping}
                    className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none text-text disabled:opacity-50 font-medium placeholder:text-muted/40 uppercase tracking-tight"
                  />
                  <button 
                    type="submit"
                    disabled={!inputValue.trim() || !agentInstance || isTyping}
                    className="px-5 bg-text text-white flex items-center justify-center hover:bg-accent-3 transition-all disabled:opacity-30 border-l border-border"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </AnimatedSection>

      </div>
    </section>
  );
}
