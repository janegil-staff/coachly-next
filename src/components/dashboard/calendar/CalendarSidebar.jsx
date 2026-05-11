"use client";
// Right-column sidebar for the calendar tab. Four collapsibles,
// all closed by default:
//   1. Monthly averages — header shows N days logged
//   2. Relevant tips    — badge with count of unviewed tips
//   3. Questionnaires   — outer collapsible wrapping nested per-questionnaire
//                          collapsibles (Goal Check-in, plus future PSS-10
//                          / PSQI / IPAQ-SF)
//   4. Exercises        — saved library + logged-from-workouts, grouped
//                          by category, sorted by frequency
import { useMemo } from "react";
import AdviceCards from "../../../app/dashboard/AdviceCards";
import MonthlyTrendsCard from "./MonthlyTrendsCard";
import CollapsibleCard from "./CollapsibleCard";
import GoalsCard from "./GoalsCard";
import ExercisesCard from "./ExercisesCard";
import { MU } from "./theme";

export default function CalendarSidebar({
  data,
  profile,
  month,
  monthLogs,
  latestGoals,
  latestPss10,
  latestPsqi,
  latestIpaq,
  exercises,
  onOpenGoals,
  t,
  lang,
}) {
  const allLogs = data?.logs ?? [];

  // Unviewed-yet-relevant tips
const tipsCount = useMemo(() => {
  const rel = profile?.relevantAdvice;
  return Array.isArray(rel) ? rel.length : 0;
}, [profile]);
  // Questionnaires with data
  const questionnaireCount = useMemo(() => {
    let n = 0;
    if (latestGoals) n++;
    // if (latestPss10) n++;
    // if (latestPsqi) n++;
    // if (latestIpaq) n++;
    return n;
  }, [latestGoals]);

  // Exercises badge — total of (saved library) ∪ (distinct logged exercises).
  const exercisesCount = useMemo(() => {
    const keys = new Set();
    for (const ex of exercises ?? []) {
      keys.add(ex.slug ? `slug:${ex.slug}` : `id:${ex._id}`);
    }
    for (const log of allLogs) {
      const ws = Array.isArray(log.workouts) ? log.workouts : [];
      for (const w of ws) {
        if (w.exerciseSlug) keys.add(`slug:${w.exerciseSlug}`);
        else if (w.exerciseId) keys.add(`id:${w.exerciseId}`);
        else if (w.name) keys.add(`name:${String(w.name).toLowerCase().trim()}`);
      }
    }
    return keys.size;
  }, [exercises, allLogs]);

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Monthly averages */}
      <CollapsibleCard
        title={t.monthlyAverages ?? "Monthly averages"}
        defaultOpen={false}
        noPadding
        rightSlot={
          <span
            className="text-[10px] font-semibold mr-2"
            style={{ color: MU }}
          >
            {monthLogs.length} {t.daysLoggedLower ?? "days logged"}
          </span>
        }
      >
        <div style={{ padding: 12 }}>
          <MonthlyTrendsCard data={data} t={t} month={month} />
        </div>
      </CollapsibleCard>

      {/* 2. Relevant tips */}
      <CollapsibleCard
        title={t.relevantTips ?? "Relevant tips"}
        defaultOpen={false}
        badge={tipsCount > 0 ? tipsCount : null}
      >
        <div className="pt-2">
          <AdviceCards
            relevantAdvice={profile?.relevantAdvice}
            viewedAdvice={profile?.viewedAdvice}
            t={t}
          />
        </div>
      </CollapsibleCard>

      {/* 3. Questionnaires */}
      <CollapsibleCard
        title={t.questionnaires ?? "Questionnaires"}
        defaultOpen={false}
        badge={questionnaireCount > 0 ? questionnaireCount : null}
      >
        <div className="pt-2 flex flex-col gap-2">
          <CollapsibleCard
            title={t.goalsTitle ?? "Goal Check-in"}
            defaultOpen={false}
            nested
            rightSlot={
              latestGoals?.date && (
                <span
                  className="text-[10px] font-semibold mr-1"
                  style={{ color: MU }}
                >
                  {latestGoals.date}
                </span>
              )
            }
          >
            <GoalsCard data={latestGoals} t={t} onReadMore={onOpenGoals} />
          </CollapsibleCard>

          {/* Future questionnaires drop in here as nested collapsibles:
          <CollapsibleCard title={t.pss10Title ?? "PSS-10"} defaultOpen={false} nested>
            <QuestionnaireCard type="pss10" latest={latestPss10} t={t} locale={lang} />
          </CollapsibleCard>
          <CollapsibleCard title={t.psqiTitle ?? "PSQI"} defaultOpen={false} nested>
            <QuestionnaireCard type="psqi" latest={latestPsqi} t={t} locale={lang} />
          </CollapsibleCard>
          <CollapsibleCard title={t.ipaqTitle ?? "IPAQ-SF"} defaultOpen={false} nested>
            <QuestionnaireCard type="ipaq" latest={latestIpaq} t={t} locale={lang} />
          </CollapsibleCard>
          */}
        </div>
      </CollapsibleCard>

      {/* 4. Exercises */}
      <CollapsibleCard
        title={t.exercises ?? "Exercises"}
        defaultOpen={false}
        badge={exercisesCount > 0 ? exercisesCount : null}
      >
        <ExercisesCard logs={allLogs} exercises={exercises} t={t} />
      </CollapsibleCard>
    </div>
  );
}