import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import PageLayout from './components/layout/PageLayout';
import HomePage from './pages/HomePage';
import RegexForgePage from './pages/RegexForgePage';
import PlaceholderPage from './pages/PlaceholderPage';

function ThemeWatcher() {
  const theme = useAppStore(s => s.theme);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeWatcher />
      <PageLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/regex" element={<RegexForgePage />} />
          <Route path="/tools" element={<PlaceholderPage title="工具箱" icon="🔧" desc="伤害计算器、天赋模拟、词缀查询等实用工具" />} />
          <Route path="/builds" element={<PlaceholderPage title="BD构建" icon="📋" desc="热门 BD 分享、装备搭配推荐、天赋树导入" />} />
          <Route path="/guide" element={<PlaceholderPage title="攻略中心" icon="📖" desc="新手入门指南、赛季机制解读、Boss 攻略" />} />
        </Routes>
      </PageLayout>
    </BrowserRouter>
  );
}
