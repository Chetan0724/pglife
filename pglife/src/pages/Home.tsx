import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Search, MapPin, Home as HomeIcon, Building, Star } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

// Update the hero background image
const heroBackground = "url('/images/hero-bg.jpg')"; // Add this image to your public folder

// Update the featured properties with better images
const featuredProperties = [
  {
    id: '1',
    title: 'Modern 1BHK Apartment',
    location: 'Koramangala, Bangalore',
    rent_amount: 15000,
    deposit_amount: 30000,
    property_type: '1BHK',
    furnishing_status: 'furnished',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070'],
    rating: 4.5,
    reviews: 12,
  },
  {
    id: '2',
    title: 'Spacious 2BHK Flat',
    location: 'HSR Layout, Bangalore',
    rent_amount: 22000,
    deposit_amount: 44000,
    property_type: '2BHK',
    furnishing_status: 'semi-furnished',
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2080'],
    rating: 4.2,
    reviews: 8,
  },
  {
    id: '3',
    title: 'PG for Women',
    location: 'Indiranagar, Bangalore',
    rent_amount: 9000,
    deposit_amount: 18000,
    property_type: 'PG',
    furnishing_status: 'furnished',
    images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2071'],
    rating: 4.7,
    reviews: 15,
  },
  {
    id: '4',
    title: 'Independent House with Garden',
    location: 'Whitefield, Bangalore',
    rent_amount: 35000,
    deposit_amount: 70000,
    property_type: 'independent',
    furnishing_status: 'unfurnished',
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070'],
    rating: 4.8,
    reviews: 6,
  },
];

// Update popular cities with better images
const popularCities = [
  { name: 'Bangalore', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=2070' },
  { name: 'Mumbai', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=2070' },
  { name: 'Delhi', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=2070' },
  { name: 'Hyderabad', image: 'https://images.unsplash.com/photo-1605146769289-440113cc3d00?q=80&w=2070' },
  { name: 'Pune', image: 'https://images.unsplash.com/photo-1672239792522-1aa29b30c60b?q=80&w=2070' },
  { name: 'Chennai', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=2070' },
];

const Home = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/properties?location=${encodeURIComponent(searchQuery)}`);
  };

  const handleCityClick = (city: string) => {
    navigate(`/properties?location=${encodeURIComponent(city)}`);
  };

  return (
    <Layout>
      {/* Hero Section with parallax effect */}
      <section 
        className="relative min-h-[600px] bg-cover bg-center bg-fixed"
        style={{ 
          backgroundImage: heroBackground,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
        <div className="container mx-auto px-4 py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white animate-fade-in">
              {t('findYourPerfectHome')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              {t('homeHeroSubtitle')}
            </p>

            {/* Enhanced Search Form */}
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 bg-white/10 backdrop-blur-md p-4 rounded-xl">
              <div className="relative flex-grow">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  className="w-full pl-12 pr-4 py-4 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white/30"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90 text-white py-4 px-8 rounded-lg text-lg font-semibold"
              >
                <Search className="mr-2 h-5 w-5" /> {t('search')}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Properties with enhanced cards */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
            {t('featuredProperties')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProperties.map((property) => (
              <div
                key={property.id}
                className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="relative h-56">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/70 transition-all"></div>
                  <div className="absolute top-3 right-3 bg-primary/90 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {property.property_type}
                  </div>
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-xl font-bold text-white mb-1">{property.title}</h3>
                    <div className="flex items-center text-white/90">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{property.location}</span>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center mb-4">
                    <Star className="h-5 w-5 text-yellow-500 mr-1" />
                    <span className="font-medium">{property.rating}</span>
                    <span className="text-muted-foreground ml-1">
                      ({property.reviews} {t('reviews')})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(property.rent_amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">/month</p>
                    </div>
                    <Button
                      variant="outline"
                      className="hover:bg-primary hover:text-white transition-colors"
                      onClick={() => navigate(`/property/${property.id}`)}
                    >
                      {t('viewDetails')}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button 
              onClick={() => navigate('/properties')} 
              size="lg"
              className="bg-primary/90 hover:bg-primary text-white px-8 py-6 text-lg rounded-xl"
            >
              {t('viewAllProperties')}
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Cities with enhanced cards */}
      <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
            {t('popularCities')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {popularCities.map((city) => (
              <div
                key={city.name}
                className="relative rounded-xl overflow-hidden h-48 cursor-pointer group"
                onClick={() => handleCityClick(city.name)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 group-hover:from-black/80 transition-all"></div>
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-2xl font-bold group-hover:scale-110 transition-transform">
                    {city.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works with enhanced design */}
      <section className="py-20 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-16 text-center bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
            {t('howItWorks')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Search, title: 'search', desc: 'searchDescription' },
              { icon: HomeIcon, title: 'connect', desc: 'connectDescription' },
              { icon: Building, title: 'moveIn', desc: 'moveInDescription' }
            ].map((item, index) => (
              <div key={index} className="text-center group hover:-translate-y-2 transition-transform">
                <div className="bg-gradient-to-br from-primary to-primary/60 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <item.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{t(item.title)}</h3>
                <p className="text-muted-foreground text-lg">
                  {t(item.desc)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with enhanced design */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">{t('areYouPropertyOwner')}</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
            {t('propertyOwnerCTA')}
          </p>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/login?redirect=owner')}
            className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg rounded-xl"
          >
            {t('listYourProperty')}
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Home;