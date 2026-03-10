import * as React from "react";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

// Auto-scroll hook
interface ScrollState {
  isAtBottom: boolean;
  autoScrollEnabled: boolean;
}

interface UseAutoScrollOptions {
  offset?: number;
  smooth?: boolean;
  content?: React.ReactNode;
}

export function useAutoScroll(options: UseAutoScrollOptions = {}) {
  const { offset = 20, smooth = false, content } = options;
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const lastContentHeight = React.useRef(0);
  const userHasScrolled = React.useRef(false);

  const [scrollState, setScrollState] = React.useState<ScrollState>({
    isAtBottom: true,
    autoScrollEnabled: true,
  });

  const checkIsAtBottom = React.useCallback(
    (element: HTMLElement) => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      const distanceToBottom = Math.abs(
        scrollHeight - scrollTop - clientHeight
      );
      return distanceToBottom <= offset;
    },
    [offset]
  );

  const scrollToBottom = React.useCallback(
    (instant?: boolean) => {
      if (!scrollRef.current) return;

      const targetScrollTop =
        scrollRef.current.scrollHeight - scrollRef.current.clientHeight;

      if (instant) {
        scrollRef.current.scrollTop = targetScrollTop;
      } else {
        scrollRef.current.scrollTo({
          top: targetScrollTop,
          behavior: smooth ? "smooth" : "auto",
        });
      }

      setScrollState({
        isAtBottom: true,
        autoScrollEnabled: true,
      });
      userHasScrolled.current = false;
    },
    [smooth]
  );

  const handleScroll = React.useCallback(() => {
    if (!scrollRef.current) return;

    const atBottom = checkIsAtBottom(scrollRef.current);

    setScrollState((prev) => ({
      isAtBottom: atBottom,
      // Re-enable auto-scroll if at bottom
      autoScrollEnabled: atBottom ? true : prev.autoScrollEnabled,
    }));
  }, [checkIsAtBottom]);

  React.useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    element.addEventListener("scroll", handleScroll, { passive: true });
    return () => element.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  React.useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const currentHeight = scrollElement.scrollHeight;
    const hasNewContent = currentHeight !== lastContentHeight.current;

    if (hasNewContent) {
      if (scrollState.autoScrollEnabled) {
        requestAnimationFrame(() => {
          scrollToBottom(lastContentHeight.current === 0);
        });
      }
      lastContentHeight.current = currentHeight;
    }
  }, [content, scrollState.autoScrollEnabled, scrollToBottom]);

  React.useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver(() => {
      if (scrollState.autoScrollEnabled) {
        scrollToBottom(true);
      }
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [scrollState.autoScrollEnabled, scrollToBottom]);

  const disableAutoScroll = React.useCallback(() => {
    const atBottom = scrollRef.current
      ? checkIsAtBottom(scrollRef.current)
      : false;

    // Only disable if not at bottom
    if (!atBottom) {
      userHasScrolled.current = true;
      setScrollState((prev) => ({
        ...prev,
        autoScrollEnabled: false,
      }));
    }
  }, [checkIsAtBottom]);

  return {
    scrollRef,
    isAtBottom: scrollState.isAtBottom,
    autoScrollEnabled: scrollState.autoScrollEnabled,
    scrollToBottom: () => scrollToBottom(false),
    disableAutoScroll,
  };
}

// Chat Message List Component
interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  smooth?: boolean;
}

const ChatMessageList = React.forwardRef<HTMLDivElement, ChatMessageListProps>(
  ({ className, children, smooth = false, ...props }, _ref) => {
    const {
      scrollRef,
      isAtBottom,
      autoScrollEnabled,
      scrollToBottom,
      disableAutoScroll,
    } = useAutoScroll({
      smooth,
      content: children,
    });

    return (
      <div className="relative w-full h-full">
        <div
          className={`flex flex-col w-full h-full p-4 overflow-y-auto ${className}`}
          ref={scrollRef}
          onWheel={disableAutoScroll}
          onTouchMove={disableAutoScroll}
          {...props}
        >
          <div className="flex flex-col gap-6">{children}</div>
        </div>

        {!isAtBottom && (
          <Button
            onClick={() => {
              scrollToBottom();
            }}
            size="icon"
            variant="outline"
            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 inline-flex rounded-full shadow-md"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  },
);

ChatMessageList.displayName = "ChatMessageList";

export { ChatMessageList };
