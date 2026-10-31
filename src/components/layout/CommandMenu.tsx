import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  Layers,
  Briefcase,
  Cpu,
  FolderGit2,
  Images,
  Mail,
  Copy,
  ArrowUp,
  X,
  Check,
  FileText,
} from "lucide-react";
import { config } from "../../constants/config";
import { usePortfolioContent } from "../../features/portfolio/content-context";
import { trackCvDownload } from "../../features/portfolio/tracking";
import { scrollToId } from "../../utils/scrollTo";

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandMenu: React.FC<CommandMenuProps> = ({ isOpen, onClose }) => {
  const { profile, gallery } = usePortfolioContent();
  const contactEmail = profile.email || config.html.email;
  const resumeUrl = profile.resumeUrl || "/cv-raypurba.pdf";
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    setSearch("");
    setActiveIndex(0);
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [search]);

  useEffect(() => {
    itemRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!isOpen) return null;

  const navigateTo = (id: string) => {
    onClose();
    scrollToId(id);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 1200);
  };

  const actions = [
    {
      id: "about",
      name: "About & Craft Overview",
      icon: <Layers size={16} className="text-acid" />,
      category: "Navigation",
      perform: () => navigateTo("about"),
    },
    {
      id: "work",
      name: "Selected Works & Architecture",
      icon: <FolderGit2 size={16} className="text-acid" />,
      category: "Navigation",
      perform: () => navigateTo("work"),
    },
    {
      id: "experience",
      name: "Experience & Timeline",
      icon: <Briefcase size={16} className="text-acid" />,
      category: "Navigation",
      perform: () => navigateTo("experience"),
    },
    {
      id: "tech",
      name: "Tech Stack & Playground",
      icon: <Cpu size={16} className="text-acid" />,
      category: "Navigation",
      perform: () => navigateTo("tech"),
    },
    ...(gallery.length > 0
      ? [
          {
            id: "gallery",
            name: "Gallery & Visual Archive",
            icon: <Images size={16} className="text-acid" />,
            category: "Navigation",
            perform: () => navigateTo("gallery"),
          },
        ]
      : []),
    {
      id: "contact",
      name: "Initiate Transmission / Contact",
      icon: <Mail size={16} className="text-acid" />,
      category: "Navigation",
      perform: () => navigateTo("contact"),
    },
    {
      id: "copy-email",
      name: copied ? "Email Copied to Clipboard!" : `Copy Email (${contactEmail})`,
      icon: copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-white/70" />,
      category: "Action",
      perform: copyEmail,
    },
    {
      id: "download-cv",
      name: "Download Resume / CV (PDF)",
      icon: <FileText size={16} className="text-white/70" />,
      category: "Action",
      perform: () => {
        trackCvDownload();
        window.open(resumeUrl, "_blank");
        onClose();
      },
    },
    {
      id: "scroll-top",
      name: "Return to Top",
      icon: <ArrowUp size={16} className="text-white/70" />,
      category: "Action",
      perform: () => navigateTo("top"),
    },
  ];

  const filtered = actions.filter((action) =>
    action.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!filtered.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % filtered.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        (index) => (index - 1 + filtered.length) % filtered.length
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      filtered[activeIndex]?.perform();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command menu"
        className="w-full max-w-xl rounded-2xl bg-[#121216] border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleMenuKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-white/[0.02]">
          <Search size={18} className="text-white/40" />
          <input
            autoFocus
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or jump to section..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 outline-none font-sans"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Command Options List */}
        <div
          role="listbox"
          aria-label="Commands"
          className="max-h-80 overflow-y-auto p-2 space-y-1"
        >
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-white/40">
              No matching commands found.
            </div>
          ) : (
            filtered.map((action, index) => (
              <button
                key={action.id}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                role="option"
                aria-selected={index === activeIndex}
                onClick={action.perform}
                onPointerEnter={() => setActiveIndex(index)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-colors group ${index === activeIndex
                  ? "bg-white/[0.06]"
                  : "hover:bg-white/[0.06]"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-lg bg-white/5 border transition-colors ${index === activeIndex
                      ? "border-acid/30"
                      : "border-white/5 group-hover:border-acid/30"
                      }`}
                  >
                    {action.icon}
                  </div>
                  <span className="text-sm font-medium text-white/90 group-hover:text-white">
                    {action.name}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-white/30 uppercase tracking-wider">
                  {action.category}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer Hint Bar */}
        <div className="px-4 py-2.5 border-t border-white/5 bg-black/40 flex items-center justify-between text-[11px] font-mono text-white/40">
          <span>Navigation Quick Hub</span>
          <div className="flex items-center gap-2">
            <span>Esc to exit</span>
            <span>•</span>
            <span>↵ to select</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandMenu;
