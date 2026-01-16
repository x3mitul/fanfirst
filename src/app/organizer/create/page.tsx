"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Plus,
  Trash2,
  Info,
  Calendar,
  MapPin,
  Clock,
  Image as ImageIcon,
  Ticket,
  DollarSign,
  Check,
  Percent,
  Shield,
  XSquare,
} from "lucide-react";
import { Button } from "@/components/ui";

type TicketTier = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description: string;
  benefits: string[];
};

export default function CreateEventPage() {
  const [step, setStep] = useState(1);
  const [eventData, setEventData] = useState({
    title: "",
    artist: "",
    description: "",
    category: "concert",
    date: "",
    time: "",
    venue: "",
    location: "",
    image: "",
  });

  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([
    {
      id: "tier-1",
      name: "General Admission",
      price: 75,
      quantity: 500,
      description: "Standard entry",
      benefits: ["Event access", "Digital collectible"],
    },
  ]);

  const [resaleSettings, setResaleSettings] = useState({
    enabled: true,
    maxMarkup: 20,
    royaltyPercent: 10,
    minFandomScore: 0,
  });

  const addTier = () => {
    setTicketTiers([
      ...ticketTiers,
      {
        id: `tier-${ticketTiers.length + 1}`,
        name: "",
        price: 0,
        quantity: 100,
        description: "",
        benefits: [],
      },
    ]);
  };

  const removeTier = (id: string) => {
    if (ticketTiers.length > 1) {
      setTicketTiers(ticketTiers.filter((t) => t.id !== id));
    }
  };

  const updateTier = (id: string, field: keyof TicketTier, value: string | number | string[]) => {
    setTicketTiers(
      ticketTiers.map((t) =>
        t.id === id ? { ...t, [field]: value } : t
      )
    );
  };

  const totalTickets = ticketTiers.reduce((sum, t) => sum + t.quantity, 0);
  const avgPrice = ticketTiers.reduce((sum, t) => sum + t.price * t.quantity, 0) / totalTickets || 0;

  const steps = [
    { num: 1, label: "DETAILS" },
    { num: 2, label: "TICKETS" },
    { num: 3, label: "RULES" },
    { num: 4, label: "LAUNCH" },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-4 lg:p-8 font-sans pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-zinc-800">
          <div>
            <h1 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter">
              Create <span className="text-primary">Event</span>
            </h1>
            <p className="text-zinc-500 font-mono mt-2">
              System Initialization // New Event Sequence
            </p>
          </div>
          <Link href="/organizer">
            <Button variant="outline" className="h-12 w-12 p-0 flex items-center justify-center">
              <XSquare className="w-6 h-6" />
            </Button>
          </Link>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-4 mb-12 border-2 border-zinc-800 bg-zinc-950">
          {steps.map((s) => (
            <div
              key={s.num}
              className={`relative p-4 flex flex-col items-center justify-center text-center border-r-2 border-zinc-800 last:border-r-0 transition-all duration-300 ${
                step === s.num
                  ? "bg-primary text-black"
                  : step > s.num
                  ? "bg-zinc-900 text-primary"
                  : "bg-black text-zinc-600"
              }`}
            >
              <div className="font-black text-xl mb-1">0{s.num}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black border-2 border-zinc-800 p-6 lg:p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] relative"
        >
          {/* Step 1: Event Details */}
          {step === 1 && (
            <div className="space-y-8">
              <div className="border-l-4 border-primary pl-4">
                <h2 className="text-2xl font-black uppercase tracking-tight">Configuration</h2>
                <p className="text-zinc-500 text-sm font-mono mt-1">INPUT EVENT PARAMETERS</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-primary">Event Title</label>
                  <input
                    type="text"
                    value={eventData.title}
                    onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                    placeholder="ENTER EVENT TITLE..."
                    className="w-full px-4 py-4 bg-zinc-950 border-2 border-zinc-800 focus:border-primary text-lg font-bold outline-none uppercase placeholder:text-zinc-800 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-primary">Artist / Entity</label>
                  <input
                    type="text"
                    value={eventData.artist}
                    onChange={(e) => setEventData({ ...eventData, artist: e.target.value })}
                    placeholder="ARTIST NAME"
                    className="w-full px-4 py-4 bg-zinc-950 border-2 border-zinc-800 focus:border-primary font-bold outline-none uppercase placeholder:text-zinc-800 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-primary">Category</label>
                  <select
                    value={eventData.category}
                    onChange={(e) => setEventData({ ...eventData, category: e.target.value })}
                    className="w-full px-4 py-4 bg-zinc-950 border-2 border-zinc-800 focus:border-primary font-bold outline-none uppercase transition-colors appearance-none rounded-none"
                  >
                    <option value="concert">Concert</option>
                    <option value="festival">Festival</option>
                    <option value="sports">Sports</option>
                    <option value="rave">Rave</option>
                    <option value="exhibition">Exhibition</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Date
                  </label>
                  <input
                    type="date"
                    value={eventData.date}
                    onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                    className="w-full px-4 py-4 bg-zinc-950 border-2 border-zinc-800 focus:border-primary font-bold outline-none uppercase transition-colors rounded-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Time
                  </label>
                  <input
                    type="time"
                    value={eventData.time}
                    onChange={(e) => setEventData({ ...eventData, time: e.target.value })}
                    className="w-full px-4 py-4 bg-zinc-950 border-2 border-zinc-800 focus:border-primary font-bold outline-none uppercase transition-colors rounded-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Venue
                  </label>
                  <input
                    type="text"
                    value={eventData.venue}
                    onChange={(e) => setEventData({ ...eventData, venue: e.target.value })}
                    placeholder="VENUE NAME"
                    className="w-full px-4 py-4 bg-zinc-950 border-2 border-zinc-800 focus:border-primary font-bold outline-none uppercase placeholder:text-zinc-800 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-primary">Location</label>
                  <input
                    type="text"
                    value={eventData.location}
                    onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                    placeholder="CITY, COUNTRY"
                    className="w-full px-4 py-4 bg-zinc-950 border-2 border-zinc-800 focus:border-primary font-bold outline-none uppercase placeholder:text-zinc-800 transition-colors"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-primary">Data Stream</label>
                  <textarea
                    value={eventData.description}
                    onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                    placeholder="EVENT DESCRIPTION..."
                    rows={4}
                    className="w-full px-4 py-4 bg-zinc-950 border-2 border-zinc-800 focus:border-primary font-mono text-sm outline-none placeholder:text-zinc-800 transition-colors resize-none rounded-none"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <ImageIcon className="w-3 h-3" /> Cover Visual
                  </label>
                  <div className="border-2 border-dashed border-zinc-800 hover:border-primary bg-zinc-950/50 p-12 text-center transition-all cursor-pointer group">
                    <Upload className="w-12 h-12 text-zinc-700 group-hover:text-primary mx-auto mb-4 transition-colors" />
                    <p className="font-bold text-zinc-500 group-hover:text-white uppercase transition-colors">Upload Asset</p>
                    <p className="text-xs font-mono text-zinc-700 mt-2">MAX 10MB // PNG JPG</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Ticket Tiers */}
          {step === 2 && (
            <div className="space-y-8">
              <div className="border-l-4 border-primary pl-4">
                <h2 className="text-2xl font-black uppercase tracking-tight">Access Control</h2>
                <p className="text-zinc-500 text-sm font-mono mt-1">DEFINE TICKET CLASSES</p>
              </div>

              <div className="space-y-6">
                {ticketTiers.map((tier, index) => (
                  <div
                    key={tier.id}
                    className="bg-zinc-950 border-2 border-zinc-800 p-6 relative group"
                  >
                    <div className="absolute top-0 right-0 bg-zinc-800 text-xs font-bold px-2 py-1 text-zinc-400 font-mono">
                         ID: {tier.id.toUpperCase()}
                    </div>
                    
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-black uppercase text-white">Tier {index + 1}</h3>
                      {ticketTiers.length > 1 && (
                        <button
                          onClick={() => removeTier(tier.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Tier Name</label>
                        <input
                          type="text"
                          value={tier.name}
                          onChange={(e) => updateTier(tier.id, "name", e.target.value)}
                          placeholder="E.G. VIP STANDING"
                          className="w-full px-4 py-3 bg-black border-2 border-zinc-800 focus:border-primary font-bold outline-none uppercase text-sm transition-colors placeholder:text-zinc-800"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> Price
                        </label>
                        <input
                          type="number"
                          value={tier.price}
                          onChange={(e) => updateTier(tier.id, "price", Number(e.target.value))}
                          min="0"
                          className="w-full px-4 py-3 bg-black border-2 border-zinc-800 focus:border-primary font-mono font-bold outline-none text-sm transition-colors placeholder:text-zinc-800"
                        />
                      </div>

                      <div className="space-y-2">
                         <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                          <Ticket className="w-3 h-3" /> Supply
                        </label>
                        <input
                          type="number"
                          value={tier.quantity}
                          onChange={(e) => updateTier(tier.id, "quantity", Number(e.target.value))}
                          min="1"
                          className="w-full px-4 py-3 bg-black border-2 border-zinc-800 focus:border-primary font-mono font-bold outline-none text-sm transition-colors placeholder:text-zinc-800"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addTier}
                  className="w-full p-6 border-2 border-dashed border-zinc-800 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all flex items-center justify-center gap-2 group"
                >
                  <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                  <span className="font-black uppercase tracking-wider">Add Tier Sequence</span>
                </button>
              </div>

              {/* Summary */}
              <div className="bg-zinc-900 border-l-4 border-primary p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 font-mono uppercase">Total Capacity</p>
                  <p className="text-2xl font-black text-white font-mono">{totalTickets.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500 font-mono uppercase">Floor Price Avg</p>
                  <p className="text-2xl font-black text-primary font-mono">${avgPrice.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Resale Rules */}
          {step === 3 && (
            <div className="space-y-8">
               <div className="border-l-4 border-primary pl-4">
                <h2 className="text-2xl font-black uppercase tracking-tight">Secondary Market</h2>
                <p className="text-zinc-500 text-sm font-mono mt-1">CONFIGURE PROTOCOL RULES</p>
              </div>

              <div className="space-y-6">
                {/* Enable Resale */}
                <div className="flex items-center justify-between p-6 bg-zinc-950 border-2 border-zinc-800">
                  <div className="flex items-center gap-4">
                    <div className="bg-zinc-900 p-3 border border-zinc-800">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold uppercase">Resale Protocol</p>
                      <p className="text-xs text-zinc-500 font-mono">Allow P2P marketplace trading</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={resaleSettings.enabled}
                      onChange={(e) => setResaleSettings({ ...resaleSettings, enabled: e.target.checked })}
                      className="peer sr-only"
                    />
                     <div className="w-14 h-8 bg-black border-2 border-zinc-700 peer-checked:bg-primary peer-checked:border-primary transition-all after:content-[''] after:absolute after:top-[6px] after:left-[6px] after:bg-white after:border-2 after:border-black after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6"></div>
                  </label>
                </div>

                {resaleSettings.enabled && (
                  <div className="grid gap-6">
                    {/* Max Markup */}
                    <div className="bg-zinc-950 border-2 border-zinc-800 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <Percent className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-bold uppercase text-sm">Max Markup Cap</p>
                          <p className="text-xs text-zinc-500 font-mono">Limit price gouging</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={resaleSettings.maxMarkup}
                          onChange={(e) => setResaleSettings({ ...resaleSettings, maxMarkup: Number(e.target.value) })}
                          className="flex-1 h-2 bg-zinc-800 appearance-none cursor-pointer accent-primary"
                        />
                        <span className="w-20 text-right font-black font-mono text-xl text-primary">{resaleSettings.maxMarkup}%</span>
                      </div>
                    </div>

                    {/* Royalty */}
                    <div className="bg-zinc-950 border-2 border-zinc-800 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <DollarSign className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-bold uppercase text-sm">Creator Royalty</p>
                          <p className="text-xs text-zinc-500 font-mono">Per transaction revenue</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <input
                          type="range"
                          min="0"
                          max="25"
                          value={resaleSettings.royaltyPercent}
                          onChange={(e) => setResaleSettings({ ...resaleSettings, royaltyPercent: Number(e.target.value) })}
                          className="flex-1 h-2 bg-zinc-800 appearance-none cursor-pointer accent-primary"
                        />
                        <span className="w-20 text-right font-black font-mono text-xl text-primary">{resaleSettings.royaltyPercent}%</span>
                      </div>
                    </div>

                     {/* Min Fandom Score */}
                     <div className="bg-zinc-950 border-2 border-zinc-800 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <Info className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-bold uppercase text-sm">Fandom Gate</p>
                          <p className="text-xs text-zinc-500 font-mono">Min score required to buy</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="10"
                          value={resaleSettings.minFandomScore}
                          onChange={(e) => setResaleSettings({ ...resaleSettings, minFandomScore: Number(e.target.value) })}
                          className="flex-1 h-2 bg-zinc-800 appearance-none cursor-pointer accent-primary"
                        />
                        <span className="w-20 text-right font-black font-mono text-xl text-primary">{resaleSettings.minFandomScore}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-8">
              <div className="border-l-4 border-primary pl-4">
                <h2 className="text-2xl font-black uppercase tracking-tight">Finalize</h2>
                <p className="text-zinc-500 text-sm font-mono mt-1">CONFIRM DEPLOYMENT</p>
              </div>

              <div className="grid gap-6">
                <div className="bg-zinc-950 border-2 border-zinc-800 p-6">
                  <h3 className="font-black uppercase text-lg mb-6 border-b-2 border-zinc-800 pb-2">Event Manifest</h3>
                  <div className="grid md:grid-cols-2 gap-y-6 gap-x-12">
                    <div>
                      <p className="text-xs text-zinc-500 font-bold uppercase">Title</p>
                      <p className="font-bold text-lg">{eventData.title || "---"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 font-bold uppercase">Artist</p>
                      <p className="font-bold text-lg">{eventData.artist || "---"}</p>
                    </div>
                     <div>
                      <p className="text-xs text-zinc-500 font-bold uppercase">Date</p>
                      <p className="font-mono">{eventData.date} {/* separator */} {eventData.time}</p>
                    </div>
                     <div>
                      <p className="text-xs text-zinc-500 font-bold uppercase">Location</p>
                      <p className="font-mono uppercase">{eventData.venue}, {eventData.location}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-950 border-2 border-zinc-800 p-6">
                  <h3 className="font-black uppercase text-lg mb-6 border-b-2 border-zinc-800 pb-2">Ticket Manifest</h3>
                   <div className="space-y-4">
                    {ticketTiers.map((tier) => (
                      <div key={tier.id} className="flex items-center justify-between border-b border-zinc-900 pb-2 last:border-0">
                        <div>
                          <p className="font-bold uppercase">{tier.name || "UNNAMED"}</p>
                          <p className="text-xs text-zinc-500 font-mono">QTY: {tier.quantity}</p>
                        </div>
                        <p className="font-bold font-mono text-primary">${tier.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-primary/20 border-2 border-primary/50 text-white p-6 flex gap-4 items-center">
                 <div className="bg-primary text-black p-2">
                    <Check className="w-6 h-6" />
                 </div>
                 <div>
                    <h4 className="font-black uppercase">System Ready</h4>
                    <p className="text-xs font-mono text-primary-light">Smart contracts compiled. Ready for mainnet deployment.</p>
                 </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8 border-t-2 border-zinc-800 mt-12">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                PREV
              </Button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <Button onClick={() => setStep(step + 1)}>
                NEXT STEP
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button className="bg-primary text-black hover:bg-primary/90 border-transparent shadow-[4px_4px_0px_0px_#fff]">
                DEPLOY EVENT
                <Check className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
