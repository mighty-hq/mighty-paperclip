import { ToasterSonner as SonnerToaster } from '@mighty/ui/sonner';
import { toast } from '@mighty/ui/sonner';

import { useTheme } from '../../ThemeContext';

type ToasterProps = Omit<React.ComponentProps<typeof SonnerToaster>, 'theme'>;

const ToasterSonner = (props: ToasterProps) => {
  const { resolvedTheme } = useTheme();
  return <SonnerToaster theme={resolvedTheme} {...props} />;
};

export { ToasterSonner as Toaster, toast };
