import { connection } from "next/server";
import { Suspense } from "react";
import { PageTitle } from "@/components/page-title";
import { Subscriptions } from "@/components/subscriptions";
import { SourceStrip, Topology } from "@/components/topology";
import { getSnapshot } from "@/lib/snapshot";

async function LiveTopology() {
  await connection();
  const snap = await getSnapshot();
  return (
    <>
      <Topology snap={snap} />
      <SourceStrip sources={snap.sources} />
    </>
  );
}

export default function MachinesPage() {
  return (
    <>
      <PageTitle>Machines</PageTitle>
      <div className="mt-8">
        <Suspense
          fallback={<div className="h-[420px] rounded-xl border border-line" aria-busy aria-label="Loading machines" />}
        >
          <LiveTopology />
        </Suspense>
      </div>
      <Subscriptions />
    </>
  );
}
