import React from "react";
import LanguageSwitcher from "./LanguageSwitcher";

interface TopNavBarProps {
  breadcrumb: {
    label: string;
    href?: string;
    active?: boolean;
  }[];
}

const TopNavBar: React.FC<TopNavBarProps> = ({ breadcrumb }) => {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 bg-white dark:bg-[#111521] dark:border-slate-800 px-6 py-3 sticky top-0 z-10">
      <div className="flex items-center gap-2 text-sm">
        {breadcrumb.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="text-slate-400 dark:text-slate-500">/</span>
            )}
            {item.href ? (
              <a
                href={item.href}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                {item.label}
              </a>
            ) : (
              <span
                className={`font-semibold ${
                  item.active
                    ? "text-slate-800 dark:text-slate-200"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="flex flex-1 items-center justify-end gap-4">
        <div className="flex items-center gap-10">
          <LanguageSwitcher />
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDKLGYfCwr8pQfpga0hLe_uDmjLbQJB31r-Qv0RLgqW_B9S066hrsx0UcfUzyGtVQy8pmTcDfp7XMUKjO1an_rG9RWkjttcbcngrXacLhpPv6icr6oqqe5bc7FX6iVJIAGWaH5Y4c9Mwc9uMqWEpZwjI8x1H3NpLdtz70CMU_lGGL5q3H41jvN5d5w5QfDxYBGYYO-w85g_vQuH7pt2ad7k2JTo21gfAwk7gJmar3Ol0ZnM5ghUsSie8ANQRiH63xWLWhFsdTK-uw")',
            }}
          ></div>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
