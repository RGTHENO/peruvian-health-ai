import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

type ObserverEntry = {
  isIntersecting: boolean;
  target: Element;
};

let observedElements: Element[] = [];
let observerCallback: ((entries: ObserverEntry[]) => void) | null = null;

class IntersectionObserverMock {
  constructor(callback: (entries: ObserverEntry[]) => void) {
    observerCallback = callback;
  }

  observe(element: Element) {
    observedElements.push(element);
  }

  unobserve(element: Element) {
    observedElements = observedElements.filter((item) => item !== element);
  }

  disconnect() {
    observedElements = [];
  }
}

const DeferredReveal = () => {
  const revealRef = useScrollReveal<HTMLDivElement>();
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <button type="button" onClick={() => setVisible(true)}>
        Mostrar contenido
      </button>
      {visible ? (
        <div ref={revealRef} data-testid="target" className="reveal-on-scroll">
          Contenido
        </div>
      ) : null}
    </div>
  );
};

describe("useScrollReveal", () => {
  beforeEach(() => {
    observedElements = [];
    observerCallback = null;
    vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
  });

  it("observa y revela elementos que aparecen después del primer render", async () => {
    render(<DeferredReveal />);

    fireEvent.click(screen.getByRole("button", { name: "Mostrar contenido" }));

    const target = await screen.findByTestId("target");

    expect(observedElements).toContain(target);
    expect(target).not.toHaveClass("revealed");

    observerCallback?.([{ isIntersecting: true, target }]);

    await waitFor(() => {
      expect(target).toHaveClass("revealed");
    });
  });
});
