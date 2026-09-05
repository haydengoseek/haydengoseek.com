"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

declare global {
  interface Window {
    /**
     * The live Lenis instance. Published because Lenis owns scroll position:
     * anything that needs the page to hold still — a full-screen menu, a modal
     * — cannot do it with `overflow: hidden`, which Lenis ignores, and needs
     * `stop()`/`start()` instead. Undefined under reduced motion, where Lenis
     * is never constructed and native scroll applies, so always optional-chain.
     */
    __lenis?: Lenis;
  }
}

/**
 * App-wide inertial smooth scroll. Mounted once at the root layout — not
 * per-page. Skips Lenis entirely when the user prefers reduced motion,
 * leaving native scroll untouched, matching the reduced-motion checks
 * modules 66/68/70/71 already do for their own animations.
 *
 * Nothing else needs to sync to this: Motion's useScroll/useTransform
 * (ParallaxImage/Effect H, and the scroll-linked heroes in modules 16 and 67)
 * read real window scroll position, which Lenis's default mode still drives
 * every frame — just eased instead of instant.
 *
 * allowNestedScroll is on because Lenis otherwise hijacks wheel events
 * globally, which breaks any module with its own internal scroll region
 * (e.g. the Effect H demo box on /demo/animations) — with it on, Lenis
 * detects nested scrollables and lets them scroll natively instead.
 *
 * The explicit re-measuring below is load-bearing, not defensive tidying.
 * Lenis caches a scroll limit (`scrollHeight - clientHeight`) and clamps its
 * target to it. Its own observation did not pick up content growth here:
 * appending 4000px to the page moved the real limit from 19595 to 23595 while
 * wheel scrolling stayed pinned at 19595 exactly, and only re-measuring
 * released it.
 *
 * A stale limit is nastier than it sounds, because the page is not obviously
 * broken — it is scrollable up, scrollable by dragging the native scrollbar
 * (which never goes through Lenis), and simply refuses to go further down by
 * wheel or trackpad, as if it had hit an invisible floor. If the floor lands
 * inside a pinned section, that section freezes part-way through its scrubbed
 * animation, which reads as the animation having crashed rather than as a
 * scroll problem.
 *
 * It needs content that grows after Lenis measures, which is why it showed up
 * on the deployed site and not on a warm dev server: optimized images arriving
 * late and a webfont swapping in both re-flow content height, and both are
 * cache-dependent, so it comes and goes.
 *
 * Same-page anchor links are routed through Lenis rather than left to the
 * browser. A native hash jump moves the document instantly while Lenis keeps
 * animating toward its own target, so the two disagree about where the page
 * is: Motion's scroll-linked sections read a position Lenis has not caught up
 * to and freeze part-way through their scrubbed animation until the next wheel
 * event resyncs them. Landing on a pinned section from a nav link is exactly
 * the case that exposes it. Delegated from the document so links rendered
 * later — by any module, at any depth — are covered without registering
 * anything of their own.
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ autoRaf: true, allowNestedScroll: true });
    window.__lenis = lenis;
    const remeasure = () => lenis.resize();

    const observer = new ResizeObserver(remeasure);
    observer.observe(document.documentElement);
    observer.observe(document.body);

    // Images and iframes do not bubble `load`, hence the capture phase; fonts
    // swap without resizing either observed box in some layouts.
    document.addEventListener("load", remeasure, true);
    window.addEventListener("load", remeasure);
    document.fonts?.ready.then(remeasure).catch(() => {});

    const onAnchorClick = (event: MouseEvent) => {
      // Leave anything the browser should own: modified clicks (open in a new
      // tab), non-primary buttons, and handlers that already claimed the event.
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.("a");
      const href = anchor?.getAttribute("href");
      // `#` alone is the idiom for a placeholder link with no destination.
      if (!anchor || !href || !href.startsWith("#") || href === "#") return;
      if (anchor.target && anchor.target !== "_self") return;

      const target = document.getElementById(decodeURIComponent(href.slice(1)));
      if (!target) return;

      event.preventDefault();
      // A number, not the element. Passing the element let Lenis resolve the
      // offset itself and it landed ~370px past every target on the pilates
      // page; the rect is measured here, at click time, against the live
      // layout, and matches what `getBoundingClientRect` reports afterwards.
      lenis.scrollTo(target.getBoundingClientRect().top + window.scrollY);
      // Keep the URL shareable. pushState rather than assigning location.hash,
      // which would trigger the native jump this exists to avoid.
      history.pushState(null, "", href);
    };

    document.addEventListener("click", onAnchorClick);

    return () => {
      observer.disconnect();
      document.removeEventListener("load", remeasure, true);
      window.removeEventListener("load", remeasure);
      document.removeEventListener("click", onAnchorClick);
      delete window.__lenis;
      lenis.destroy();
    };
  }, []);

  return children;
}
