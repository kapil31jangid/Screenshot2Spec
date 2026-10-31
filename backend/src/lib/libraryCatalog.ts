export interface CatalogEntry {
  id: string;
  name: string;
  packageName: string;
  category: string;
  supportedUiCategories: string[];
  relevantComponents: string[];
  recommendedUseCases: string;
  installCommand: string;
  docUrl: string;
}

export const APPROVED_LIBRARY_CATALOG: Record<string, CatalogEntry> = {
  tailwind: {
    id: 'tailwind',
    name: 'Tailwind CSS',
    packageName: 'tailwindcss',
    category: 'Styling & Layout',
    supportedUiCategories: ['layout', 'grid', 'flexbox', 'spacing', 'responsive-design'],
    relevantComponents: ['Container', 'Grid', 'Flex', 'Header', 'Footer'],
    recommendedUseCases: 'Use for all foundational layout structures, responsiveness, fluid spacing, and custom visual design without bulky UI dependencies.',
    installCommand: 'npm install -D tailwindcss postcss autoprefixer',
    docUrl: 'https://tailwindcss.com/docs',
  },
  'native-html': {
    id: 'native-html',
    name: 'Native Semantic HTML',
    packageName: 'builtin',
    category: 'Primitives',
    supportedUiCategories: ['table', 'typography', 'button', 'input', 'list'],
    relevantComponents: ['table', 'thead', 'tbody', 'tr', 'td', 'th', 'button'],
    recommendedUseCases: 'Use semantic HTML elements for simple non-virtualized tables, accessible lists, and standard buttons without external package overhead.',
    installCommand: '',
    docUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
  },
  shadcn: {
    id: 'shadcn',
    name: 'shadcn/ui',
    packageName: 'shadcn/ui (radix-ui)',
    category: 'UI Component Primitives',
    supportedUiCategories: ['navigation', 'card', 'button', 'dialog', 'modal', 'select', 'dropdown', 'tabs', 'avatar', 'badge'],
    relevantComponents: ['Card', 'Button', 'Sidebar', 'Dialog', 'Select', 'DropdownMenu', 'Tabs', 'Avatar', 'Badge', 'Input'],
    recommendedUseCases: 'Accessible, unstyled, composable UI component primitives built on Radix UI that live directly inside your project code.',
    installCommand: 'npx shadcn@latest init && npx shadcn@latest add card button sidebar dialog select dropdown-menu tabs avatar badge',
    docUrl: 'https://ui.shadcn.com',
  },
  'lucide-react': {
    id: 'lucide-react',
    name: 'Lucide React',
    packageName: 'lucide-react',
    category: 'Icons',
    supportedUiCategories: ['icon', 'action-icons', 'status-icons', 'navigation-icons'],
    relevantComponents: ['Icon', 'ChevronDown', 'Search', 'Bell', 'TrendingUp', 'TrendingDown', 'Menu', 'User', 'Settings'],
    recommendedUseCases: 'Lightweight, modern, tree-shakeable SVG icons matching contemporary UI design standards.',
    installCommand: 'npm install lucide-react',
    docUrl: 'https://lucide.dev',
  },
  recharts: {
    id: 'recharts',
    name: 'Recharts',
    packageName: 'recharts',
    category: 'Data Visualization',
    supportedUiCategories: ['chart', 'analytics', 'graph', 'metrics-trend'],
    relevantComponents: ['ResponsiveContainer', 'BarChart', 'LineChart', 'AreaChart', 'PieChart', 'XAxis', 'YAxis', 'Tooltip'],
    recommendedUseCases: 'Declarative, composable React charting library designed for dashboards and analytics views.',
    installCommand: 'npm install recharts',
    docUrl: 'https://recharts.org',
  },
  'tanstack-table': {
    id: 'tanstack-table',
    name: 'TanStack Table',
    packageName: '@tanstack/react-table',
    category: 'Advanced Data Tables',
    supportedUiCategories: ['table', 'data-grid', 'sortable-table', 'paginated-table'],
    relevantComponents: ['DataTable', 'SortableHeader', 'PaginationControls', 'ColumnVisibility'],
    recommendedUseCases: 'Headless table engine providing sorting, filtering, column grouping, and pagination for data-dense tables.',
    installCommand: 'npm install @tanstack/react-table',
    docUrl: 'https://tanstack.com/table/latest',
  },
  'react-hook-form': {
    id: 'react-hook-form',
    name: 'React Hook Form + Zod',
    packageName: 'react-hook-form zod @hookform/resolvers',
    category: 'Form Management & Validation',
    supportedUiCategories: ['form', 'input-validation', 'multi-step-form', 'settings-panel'],
    relevantComponents: ['Form', 'FormField', 'FormItem', 'FormMessage', 'Input', 'Textarea'],
    recommendedUseCases: 'Performant, subscription-based form state management with end-to-end type safety via Zod validation schemas.',
    installCommand: 'npm install react-hook-form zod @hookform/resolvers',
    docUrl: 'https://react-hook-form.com',
  },
  'react-flow': {
    id: 'react-flow',
    name: 'React Flow',
    packageName: '@xyflow/react',
    category: 'Node Diagrams & Workflows',
    supportedUiCategories: ['flowchart', 'node-diagram', 'pipeline-editor', 'canvas'],
    relevantComponents: ['ReactFlow', 'Background', 'Controls', 'MiniMap', 'CustomNode'],
    recommendedUseCases: 'Interactive node-based UIs, process diagrams, workflow automations, and graph visualizations.',
    installCommand: 'npm install @xyflow/react',
    docUrl: 'https://reactflow.dev',
  },
  motion: {
    id: 'motion',
    name: 'Motion (Framer Motion)',
    packageName: 'motion',
    category: 'Animation & Gestures',
    supportedUiCategories: ['animation', 'transitions', 'micro-interactions', 'reorder'],
    relevantComponents: ['motion.div', 'AnimatePresence', 'motion.button'],
    recommendedUseCases: 'Production-ready declarative animations, modal spring physics, and layout animations.',
    installCommand: 'npm install motion',
    docUrl: 'https://motion.dev',
  },
};

export function matchComponentToLibrary(uiType: string, purpose: string): string | null {
  const typeLower = uiType.toLowerCase();
  const purposeLower = purpose.toLowerCase();

  if (typeLower.includes('chart') || typeLower.includes('graph') || purposeLower.includes('visualize revenue') || purposeLower.includes('metrics chart')) {
    return 'recharts';
  }
  if (typeLower.includes('flow') || typeLower.includes('diagram') || typeLower.includes('pipeline') || purposeLower.includes('workflow node')) {
    return 'react-flow';
  }
  if (typeLower.includes('table') || typeLower.includes('grid')) {
    if (purposeLower.includes('sorting') || purposeLower.includes('pagination') || purposeLower.includes('filtering') || purposeLower.includes('searchable')) {
      return 'tanstack-table';
    }
    return 'shadcn';
  }
  if (typeLower.includes('icon') || purposeLower.includes('icon indicator')) {
    return 'lucide-react';
  }
  if (typeLower.includes('form') || purposeLower.includes('submit') || purposeLower.includes('input validation')) {
    return 'react-hook-form';
  }
  if (typeLower.includes('sidebar') || typeLower.includes('dialog') || typeLower.includes('modal') || typeLower.includes('card') || typeLower.includes('button') || typeLower.includes('select') || typeLower.includes('dropdown')) {
    return 'shadcn';
  }
  if (typeLower.includes('animation') || purposeLower.includes('animated') || purposeLower.includes('transition')) {
    return 'motion';
  }

  return 'tailwind';
}

