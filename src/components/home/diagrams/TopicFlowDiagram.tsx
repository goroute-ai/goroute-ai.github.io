import React, { type ReactNode } from 'react';
import {
  Activity,
  AppWindow,
  Bot,
  CheckCircle2,
  Coins,
  Compass,
  Cpu,
  KeyRound,
  Layers,
  Network,
  ShieldCheck,
  SlidersHorizontal,
  Wrench,
} from 'lucide-react';
import type { TopicId } from '../../../data/homeTopics';
import { DiagramCanvas, DiagramNode, FlowArrow, FlowBranchFork } from './FlowDiagramPrimitives';
import styles from '../Home.module.css';

interface TopicFlowDiagramProps {
  topicId: TopicId;
  chips: string[];
}

/**
 * Renders a bespoke custom React + SVG flow topology for each landing-page topic tab.
 */
export default function TopicFlowDiagram({ topicId, chips }: TopicFlowDiagramProps): ReactNode {
  switch (topicId) {
    case 'start':
      return (
        <DiagramCanvas
          label="Start flow: Your app chooses a GoRoute setup and sends its first request"
          caption="Onboarding Path"
          chips={chips}
        >
          <div className={styles.flowRow}>
            <DiagramNode
              title="Your App"
              subtitle="Go or HTTP"
              icon={AppWindow}
              tone="default"
            />
            <FlowArrow />
            <DiagramNode
              title="Choose Setup"
              subtitle="Gateway or SDK"
              badges={['CLI', 'Docker', 'pkg/gateway']}
              icon={Compass}
              tone="primary"
              highlighted
            />
            <FlowArrow />
            <DiagramNode
              title="First Request"
              subtitle="Ready in minutes"
              icon={CheckCircle2}
              tone="policy"
            />
          </div>
        </DiagramCanvas>
      );

    case 'routing':
      return (
        <DiagramCanvas
          label="Routing flow: AI request passes through complexity routing and load balancing to primary and fallback providers"
          caption="Data Plane & Failover"
          chips={chips}
        >
          <div className={styles.flowRow}>
            <DiagramNode
              title="AI Request"
              subtitle="/v1/* or /anthropic"
              icon={AppWindow}
              tone="default"
            />
            <FlowArrow />
            <DiagramNode
              title="Traffic Router"
              subtitle="Classify & balance"
              badges={['6 Strategies', 'Circuit Breaker']}
              icon={Network}
              tone="primary"
              highlighted
            />
            <FlowBranchFork />
            <div className={styles.flowBranchStack}>
              <DiagramNode
                title="Primary Models"
                subtitle="Lowest latency"
                icon={Cpu}
                tone="provider"
              />
              <DiagramNode
                title="Fallback Chain"
                subtitle="Bounded retries"
                icon={SlidersHorizontal}
                tone="signal"
              />
            </div>
          </div>
        </DiagramCanvas>
      );

    case 'governance':
      return (
        <DiagramCanvas
          label="Governance flow: Request passes virtual key access checks, guardrails, and FinOps budget enforcement before reaching an approved provider"
          caption="Security, Policy & FinOps"
          chips={chips}
        >
          <div className={styles.flowRow}>
            <DiagramNode
              title="Access Scope"
              subtitle="Virtual keys & RBAC"
              icon={KeyRound}
              tone="default"
            />
            <FlowArrow />
            <DiagramNode
              title="Policy & Guardrails"
              subtitle="Pre and post hooks"
              badges={['19 Drivers', 'SSRF Safe']}
              icon={ShieldCheck}
              tone="primary"
              highlighted
            />
            <FlowBranchFork />
            <div className={styles.flowBranchStack}>
              <DiagramNode
                title="Approved Provider"
                subtitle="Vault-encrypted key"
                icon={Cpu}
                tone="provider"
              />
              <DiagramNode
                title="Budget Ledger"
                subtitle="64-bit micro-dollar"
                icon={Coins}
                tone="policy"
              />
            </div>
          </div>
        </DiagramCanvas>
      );

    case 'observability':
      return (
        <DiagramCanvas
          label="Observability flow: GoRoute forwards requests to AI providers while emitting OTLP traces and service health metrics"
          caption="Telemetry & Operator Visibility"
          chips={chips}
        >
          <div className={styles.flowRow}>
            <DiagramNode
              title="Application"
              subtitle="W3C traceparent"
              icon={AppWindow}
              tone="default"
            />
            <FlowArrow />
            <DiagramNode
              title="GoRoute Core"
              subtitle="Scrubbed telemetry"
              badges={['X-Trace-Id', 'Cost Headers']}
              icon={Layers}
              tone="primary"
              highlighted
            />
            <FlowBranchFork />
            <div className={styles.flowBranchStack}>
              <DiagramNode
                title="Request Traces"
                subtitle="OTLP spans"
                icon={Activity}
                tone="signal"
              />
              <DiagramNode
                title="Service Health"
                subtitle="Metrics & /ui/"
                icon={CheckCircle2}
                tone="policy"
              />
            </div>
          </div>
        </DiagramCanvas>
      );

    case 'agents':
      return (
        <DiagramCanvas
          label="Agent flow: AI agent connects through GoRoute Tool Hub to approved MCP tools and signed A2A agents"
          caption="Governed MCP & A2A Plane"
          chips={chips}
        >
          <div className={styles.flowRow}>
            <DiagramNode
              title="AI Agent"
              subtitle="IDE or agent loop"
              icon={Bot}
              tone="default"
            />
            <FlowArrow />
            <DiagramNode
              title="GoRoute Tool Hub"
              subtitle="Taint & schema guard"
              badges={['MCP', 'A2A v1.0']}
              icon={Layers}
              tone="primary"
              highlighted
            />
            <FlowBranchFork />
            <div className={styles.flowBranchStack}>
              <DiagramNode
                title="Approved Tools"
                subtitle="Sandboxed Stdio & REST"
                icon={Wrench}
                tone="policy"
              />
              <DiagramNode
                title="Remote Agents"
                subtitle="Signed Agent Cards"
                icon={Network}
                tone="provider"
              />
            </div>
          </div>
        </DiagramCanvas>
      );
  }
}
