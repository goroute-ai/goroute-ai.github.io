import React, { type ReactNode } from 'react';
import { AppWindow, Cpu, Layers, Users } from 'lucide-react';
import { DiagramCanvas, DiagramNode, FlowArrow, FlowBranchFork } from './FlowDiagramPrimitives';
import styles from '../Home.module.css';

/**
 * Hero architecture diagram showing requests flowing from applications
 * through the GoRoute gateway to AI providers and team visibility.
 */
export default function HeroFlowDiagram(): ReactNode {
  return (
    <DiagramCanvas
      label="Application requests flow through GoRoute gateway to AI providers and your team"
      caption="Request & Control Flow"
      chips={['Unified /v1/*', 'Guardrails & FinOps', '73+ Providers']}
      compact
    >
      <div className={styles.flowRow}>
        <DiagramNode
          title="Application"
          subtitle="SDK or HTTP client"
          icon={AppWindow}
          tone="default"
        />
        <FlowArrow />
        <DiagramNode
          title="GoRoute Gateway"
          subtitle="Control plane"
          badges={['Routing', 'Policy', 'Telemetry']}
          icon={Layers}
          tone="primary"
          highlighted
        />
        <FlowBranchFork />
        <div className={styles.flowBranchStack}>
          <DiagramNode
            title="AI Providers"
            subtitle="Models & MCP tools"
            icon={Cpu}
            tone="provider"
          />
          <DiagramNode
            title="Your Team"
            subtitle="Budgets & traces"
            icon={Users}
            tone="policy"
          />
        </div>
      </div>
    </DiagramCanvas>
  );
}
