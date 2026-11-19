import React, { type ReactNode } from 'react';
import { TOPIC_ITEMS } from '../../data/homeTopics';
import TopicBand from './TopicBand';
import styles from './Home.module.css';

/**
 * Sequential long-scroll showcase rendering all 5 GoRoute capability chapters one after another.
 */
export default function TopicShowcase(): ReactNode {
  const totalChapters = String(TOPIC_ITEMS.length).padStart(2, '0');

  return (
    <div id="capabilities" className={styles.topicsSection} aria-label="GoRoute capabilities">
      <div className={styles.topicShowcase}>
        {TOPIC_ITEMS.map((item, index) => (
          <TopicBand
            key={item.id}
            item={item}
            totalChapters={totalChapters}
            reversed={index % 2 === 1}
          />
        ))}
      </div>
    </div>
  );
}
