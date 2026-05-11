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
    <section id="demo" className="py-24 md:py-40 px-6 md:px-12 relative overflow-hidden bg-white">
      {/* Background Sophistication */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50/50 -skew-x-12 translate-x-1/4 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Left: Authoritative Capabilities */}
        <div className="lg:col-span-5">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-text animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text">Live Deployment</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-text mb-8 leading-[1.1] tracking-tight">
              An agent that <br />
              <span className="text-slate-400">commands results.</span>
            </h2>
            
            <p className="text-subdued text-lg md:text-xl mb-12 leading-relaxed max-w-md">
              Don&apos;t just chat. Automate. Our agents are engineered for high-stakes business environments where precision is the only metric that matters.
            </p>
            
            <div className="grid grid-cols-1 gap-6">
              {[
                { title: "Neural Logic", desc: "Handles complex multi-step reasoning without failure." },
                { title: "Brand Integrity", desc: "Perfectly mirrors your professional tone and values." },
                { title: "Deep Integration", desc: "Syncs directly with your existing CRM and calendar." }
              ].map((item, i) => (
                <motion.div 
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col gap-1 border-l-2 border-slate-100 pl-6 hover:border-text transition-colors duration-500 cursor-default group"
                >
                  <h4 className="text-sm font-bold uppercase tracking-widest text-text group-hover:text-accent-3 transition-colors">{item.title}</h4>
                  <p className="text-sm text-subdued">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>

        {/* Right: The Executive Console */}
        <div className="lg:col-span-7">
          <AnimatedSection delay={0.2} variant="scale-in">
            <div className="relative w-full max-w-[600px] mx-auto lg:ml-auto">
              {/* Premium Shadow & Depth */}
              <div className="absolute -inset-4 bg-slate-900/5 rounded-[2rem] blur-2xl" />
              
              <div className="relative flex flex-col h-[600px] w-full bg-slate-900 rounded-[1.5rem] shadow-2xl overflow-hidden border border-white/10">
                
                {/* Console Header */}
                <div className="px-8 py-6 flex items-center justify-between border-b border-white/5 bg-white/[0.02] backdrop-blur-md">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-900">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm tracking-tight">THARROS_COMMAND_v4</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-bright animate-pulse" />
                        <p className="text-white/40 text-[10px] font-mono uppercase">Secure Link Established</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  </div>
                </div>

                {/* Console Messages Area */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-8 flex flex-col gap-10 bg-slate-900/50 scroll-smooth"
                >
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${msg.sender === "user" ? "text-accent-bright" : "text-white/40"}`}>
                            {msg.sender === "user" ? "Authorized_Client" : "Agent_Core"}
                          </span>
                          <span className="text-[10px] text-white/20 font-mono">{msg.time}</span>
                        </div>
                        <div 
                          className={`text-base leading-relaxed font-medium ${
                            msg.sender === "user" 
                            ? "text-white bg-white/5 p-5 rounded-xl rounded-tr-none border border-white/10" 
                            : "text-white/80 pl-6 border-l border-white/20"
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
                        className="flex items-center gap-4 pl-6"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Analyzing</span>
                        <div className="flex gap-1">
                          <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-1 h-1 bg-accent-bright" />
                          <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-1 h-1 bg-accent-bright" />
                          <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="w-1 h-1 bg-accent-bright" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Console Footer */}
                <div className="p-8 pt-4 bg-slate-900 border-t border-white/5">
                  
                  {/* Quick Command Suggestions */}
                  <AnimatePresence>
                    {recommendedQuestions.length > 0 && !isTyping && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-wrap gap-2 mb-6"
                      >
                        {recommendedQuestions.map((q) => (
                          <button
                            key={q}
                            onClick={() => handleSend(q)}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[11px] font-bold text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-left"
                          >
                            {q}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form 
                    onSubmit={(e) => handleSend(inputValue, e)}
                    className="flex items-center gap-4 bg-white/5 border border-white/10 p-2 rounded-xl focus-within:border-white/20 transition-all"
                  >
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Enter command..."
                      disabled={!agentInstance || isTyping}
                      className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none disabled:opacity-50"
                    />
                    <button 
                      type="submit"
                      disabled={!inputValue.trim() || !agentInstance || isTyping}
                      className="h-12 px-6 rounded-lg bg-white text-slate-900 font-bold text-xs uppercase tracking-widest hover:bg-accent-bright hover:text-white transition-all disabled:opacity-20"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>

      </div>
    </section>
  );
}
