import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import Layout from '../components/Layout';

const NotFound = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-6">{t('pageNotFound')}</h2>
        <p className="text-muted-foreground text-center max-w-md mb-8">
          {t('pageNotFoundDescription')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={() => navigate(-1)}>
            {t('goBack')}
          </Button>
          <Button variant="outline" onClick={() => navigate('/')}>
            {t('goHome')}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound; 