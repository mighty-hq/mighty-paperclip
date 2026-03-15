import React from 'react';
import { Detail } from '@mighty/api';
import { Command, ThinkingKeyword } from '../../types';
import { generateCommandMarkdown } from '../../utils/markdownUtils';

interface DetailContentProps {
  actions?: React.ReactNode;
  command: Command;
  thinkingKeyword?: ThinkingKeyword;
}

export function DetailContent({ command, thinkingKeyword, actions }: DetailContentProps) {
  const markdown = generateCommandMarkdown(command, thinkingKeyword);

  return <Detail markdown={markdown} actions={actions} />;
}
