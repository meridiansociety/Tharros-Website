"use client";

import { useState, useEffect, useRef } from "react";
import { Client, Key, Agent, Workforce, type Task } from "@relevanceai/sdk";
import NavBar from "./NavBar";
import FooterSection from "./FooterSection";

const REGION = process.env.NEXT_PUBLIC_RELEVANCE_REGION || "";
const PROJECT = process.env.NEXT_PUBLIC_RELEVANCE_PROJECT || "";
const AGENT_ID = process.env.NEXT_PUBLIC_RELEVANCE_INTAKE_AGENT_ID || process.env.NEXT_PUBLIC_RELEVANCE_AGENT_ID || "";

export default function IntakeAgent() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [agentInstance, setAgentInstance] = useState<any>(null);
  const [currentTask, setCurrentTask] = useState<any>(null);

  useEffect(() => {
    async function init() {
      if (!REGION || !PROJECT || !AGENT_ID) return;
      try {
        const keyInstance = await Key.generateEmbedKey({
          region: REGION as any,
          project: PROJECT,
          agentId: AGENT_ID,
        }).catch(() => Key.generateEmbedKey({
          region: REGION as any,
          project: PROJECT,
          workforceId: AGENT_ID,
        }));

        const client = new Client(keyInstance);
        const resource = await Agent.get(AGENT_ID, client).catch(() => Workforce.get(AGENT_ID, client));
        setAgentInstance(resource);
        
        setMessages([{
          id: "1",
          sender: "agent",
          text: "Hello! System online. How can I help?",
          time: new Date().toLocaleTimeString()
        }]);
      } catch (e) {
        console.error("Init Error", e);
      }
    }
    init();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !agentInstance) return;
    const text = inputValue;
    setInputValue("");
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: "user", text, time: new Date().toLocaleTimeString() }]);
    const task = await agentInstance.sendMessage(text, currentTask);
    setCurrentTask(task);
  };

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <main className="pt-32 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Intake Portal</h1>
        <div className="border rounded-2xl h-[600px] flex flex-col overflow-hidden shadow-xl bg-slate-50">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-2xl max-w-[80%] ${m.sender === 'user' ? 'bg-slate-900 text-white' : 'bg-white border'}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-4">
            <input 
              value={inputValue} 
              onChange={e => setInputValue(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-xl focus:outline-none"
              placeholder="Type here..."
            />
            <button className="bg-slate-900 text-white px-6 py-2 rounded-xl">Send</button>
          </form>
        </div>
      </main>
      <FooterSection />
    </div>
  );
}
