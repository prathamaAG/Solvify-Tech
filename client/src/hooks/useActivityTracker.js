import { useEffect, useRef, useCallback } from "react";
import { apiService, commonService } from "../services";

const HEARTBEAT_INTERVAL_MS = 30000; // Send heartbeat every 30s
const THROTTLE_MS = 2000;            // Throttle activity events to every 2s
const INACTIVITY_THRESHOLD_MS = 60000; // 60s of no input = inactive

const useActivityTracker = (activeTracking) => {
  const lastActivityTimeRef = useRef(Date.now());
  const lastThrottleRef = useRef(0);
  const heartbeatIntervalRef = useRef(null);
  const isTabVisibleRef = useRef(true);
  const activityStatusRef = useRef(true);
  const lastHeartbeatTimeRef = useRef(Date.now());

  const handleActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastThrottleRef.current >= THROTTLE_MS) {
      lastActivityTimeRef.current = now;
      lastThrottleRef.current = now;
      activityStatusRef.current = true;
    }
  }, []);

  const sendHeartbeat = useCallback(async () => {
    if (!activeTracking || activeTracking.end_time) return;

    const now = Date.now();
    const timeSinceActivity = now - lastActivityTimeRef.current;
    const timeSinceLastHeartbeat = now - lastHeartbeatTimeRef.current;

    // Active ONLY if there was real mouse/keyboard/scroll activity within threshold
    // Tab visibility doesn't matter — user can be in VS Code and come back
    const isActive = timeSinceActivity < INACTIVITY_THRESHOLD_MS;

    activityStatusRef.current = isActive;
    lastHeartbeatTimeRef.current = now;

    try {
      const body = {
        tracking_id: activeTracking.tracking_id,
        task_id: activeTracking.task_id,
        is_active: isActive,
        last_activity_time: new Date(lastActivityTimeRef.current).toISOString(),
        is_tab_visible: isTabVisibleRef.current,
        // Send actual elapsed ms since last heartbeat so backend can calculate accurate delta
        ms_since_last_heartbeat: timeSinceLastHeartbeat,
      };

      await apiService.PostAPICall("sendHeartbeat", body);
    } catch (error) {
      console.error("Heartbeat failed:", error);
    } finally {
      commonService.resetAPIFlag("sendHeartbeat", false);
    }
  }, [activeTracking]);

  const handleVisibilityChange = useCallback(() => {
    const wasHidden = !isTabVisibleRef.current;
    isTabVisibleRef.current = document.visibilityState === "visible";

    // When tab becomes visible again, send an immediate heartbeat
    // to flush any inactive time that accumulated while tab was throttled
    // Do NOT reset lastActivityTime — only real input events should do that
    if (isTabVisibleRef.current && wasHidden) {
      sendHeartbeat();
    }
  }, [sendHeartbeat]);

  useEffect(() => {
    if (!activeTracking || activeTracking.end_time) {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      return;
    }

    lastActivityTimeRef.current = Date.now();
    lastThrottleRef.current = Date.now();
    lastHeartbeatTimeRef.current = Date.now();
    isTabVisibleRef.current = document.visibilityState === "visible";

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((event) => document.addEventListener(event, handleActivity));
    document.addEventListener("visibilitychange", handleVisibilityChange);

    sendHeartbeat();

    heartbeatIntervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);

    return () => {
      events.forEach((event) => document.removeEventListener(event, handleActivity));
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    };
  }, [activeTracking, handleActivity, handleVisibilityChange, sendHeartbeat]);

  return {
    isActive: activityStatusRef.current,
    lastActivityTime: lastActivityTimeRef.current,
    isTabVisible: isTabVisibleRef.current,
  };
};

export default useActivityTracker;
