import ReactMarkdown from "react-markdown";

/** Rendu Markdown sûr : le HTML brut n'est jamais interprété. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-gc">
      <ReactMarkdown
        skipHtml
        components={{
          h1: (p) => <h1 className="mb-6 text-3xl font-bold tracking-tight" {...p} />,
          h2: (p) => <h2 className="mt-10 mb-3 text-xl font-semibold" {...p} />,
          h3: (p) => <h3 className="mt-6 mb-2 font-semibold" {...p} />,
          p: (p) => <p className="mb-4 leading-relaxed" {...p} />,
          ul: (p) => <ul className="mb-4 list-disc space-y-1 pl-6" {...p} />,
          ol: (p) => <ol className="mb-4 list-decimal space-y-1 pl-6" {...p} />,
          a: ({ href, ...p }) => <a href={href} className="font-medium underline underline-offset-4" {...p} />,
          blockquote: (p) => (
            <blockquote
              className="border-gc-orange bg-gc-orange-soft mb-6 rounded-lg border-l-4 px-4 py-3 text-sm [&>p]:mb-1"
              {...p}
            />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
