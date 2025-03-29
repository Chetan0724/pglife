import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Bed, Bath, Home, IndianRupee } from 'lucide-react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useLanguage } from '../contexts/LanguageContext';
import { formatCurrency } from '../lib/utils';
import { motion } from 'framer-motion';

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  rent_amount: number;
  deposit_amount: number;
  property_type: string;
  furnishing_status: string;
  images: string[];
  rating: number;
  reviews: number;
  bedrooms?: number;
  bathrooms?: number;
}

const PropertyCard = ({
  id,
  title,
  location,
  rent_amount,
  deposit_amount,
  property_type,
  furnishing_status,
  images,
  rating,
  reviews,
  bedrooms,
  bathrooms,
}: PropertyCardProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 bg-card">
        <div className="relative h-56">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/70 transition-all z-10" />
          <Badge 
            variant="secondary" 
            className="absolute top-3 right-3 z-20 bg-primary/90 text-white hover:bg-primary"
          >
            {property_type}
          </Badge>
          <div className="absolute top-3 left-3 z-20 flex items-center space-x-1 bg-white/90 rounded-full px-2 py-1">
            <Star className="h-3.5 w-3.5 text-yellow-500" />
            <span className="text-xs font-medium text-foreground">{rating}</span>
            <span className="text-xs text-muted-foreground">
              ({reviews})
            </span>
          </div>
          <img
            src={images[0]}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute bottom-3 left-3 right-3 z-20">
            <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{title}</h3>
            <div className="flex items-center text-white/90">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="text-sm line-clamp-1">{location}</span>
            </div>
          </div>
        </div>

        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center text-2xl font-bold text-primary">
                <IndianRupee className="h-5 w-5 mr-1" />
                <span>{formatCurrency(rent_amount, false)}</span>
              </div>
              <p className="text-sm text-muted-foreground">{t('per Month')}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{t('deposit')}</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(deposit_amount)}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                {bedrooms && (
                  <div className="flex items-center text-muted-foreground">
                    <Bed className="h-4 w-4 mr-1" />
                    <span>{bedrooms} {t('beds')}</span>
                  </div>
                )}
                {bathrooms && (
                  <div className="flex items-center text-muted-foreground">
                    <Bath className="h-4 w-4 mr-1" />
                    <span>{bathrooms} {t('baths')}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center text-muted-foreground">
                <Home className="h-4 w-4 mr-1" />
                <span className="capitalize">{furnishing_status}</span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0">
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-white"
            onClick={() => navigate(`/property/${id}`)}
          >
            {t('viewDetails')}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default PropertyCard; 