import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Search, MapPin, Home as HomeIcon, Building, Star, ArrowRight } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { motion } from 'framer-motion';

// Update the hero background image
const heroBackground = "url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070')";

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

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
        className="relative min-h-[80vh] bg-cover bg-center bg-fixed flex items-center"
        style={{ backgroundImage: heroBackground }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/60"></div>
        <motion.div 
          className="container mx-auto px-4 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              {t('Find Your Perfect Home')}
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl mb-8 text-white/90"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              {t('Find the perfect paying guest accommodation, flat, or room for rent with PG Life')}
            </motion.p>

            {/* Enhanced Search Form */}
            <motion.form 
              onSubmit={handleSearch} 
              className="flex flex-col md:flex-row gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <div className="relative flex-grow">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white" />
                <input
                  type="text"
                  placeholder={t('Search PGs by city, locality, or amenities')}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white/30 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90 text-white py-4 px-8 rounded-xl text-lg font-semibold transition-all duration-300 hover:scale-105"
              >
                <Search className="mr-2 h-5 w-5" /> {t('search')}
              </Button>
            </motion.form>
          </div>
        </motion.div>
      </section>

      {/* Featured Properties */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/20">
        <motion.div 
          className="container mx-auto px-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
              {t('featuredProperties')}
            </h2>
            <p className="text-lg text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              {t('Explore our handpicked selection of featured properties, each designed to meet your unique needs and preferences. From modern apartments to cozy flats, we have something for everyone. Discover your perfect home today!')}
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                variants={itemVariants}
                custom={index}
              >
                <PropertyCard {...property} />
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            className="text-center mt-12"
            variants={itemVariants}
          >
            <Button 
              onClick={() => navigate('/properties')} 
              size="lg"
              className="bg-primary/90 hover:bg-primary text-white px-8 py-6 text-lg rounded-xl group transition-all duration-300 hover:scale-105"
            >
              {t('viewAllProperties')}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Popular Cities */}
      <section className="py-24 bg-gradient-to-b from-muted/20 to-background">
        <motion.div 
          className="container mx-auto px-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
              {t('popularCities')}
            </h2>
            <p className="text-lg text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              {t('Explore the most popular cities for renting PGs, flats, and apartments. From bustling metropolises to charming coastal towns, we have the perfect rental for you. Start your search today and find your dream home in your favorite city!')}
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {popularCities.map((city, index) => (
              <motion.div
                key={city.name}
                variants={itemVariants}
                custom={index}
              >
                <Card
                  className="relative rounded-xl overflow-hidden h-48 cursor-pointer group border-0 shadow-lg"
                  onClick={() => handleCityClick(city.name)}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 group-hover:from-black/80 transition-all z-10"></div>
                  <img
                    src={city.image}
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <h3 className="text-white text-2xl font-bold group-hover:scale-110 transition-transform">
                      {city.name}
                    </h3>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-b from-background to-primary/5">
        <motion.div 
          className="container mx-auto px-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
              {t('howItWorks')}
            </h2>
            <p className="text-lg text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
              {t('How it works')}
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Search, title: 'Search', desc: 'Find your perfect rental space effortlessly. Browse through a wide range of rooms, flats, and apartments that fit your budget and preferences. Save your favorite listings to compare and decide later.' },
              { icon: HomeIcon, title: 'Connect', desc: 'Connect with property owners or agents to get detailed information about the property, including photos, floor plans, and availability. Get in touch to schedule a visit or ask any questions.' },
              { icon: Building, title: 'Move In', desc: 'Finalize your rental agreement, complete the necessary paperwork, and move into your new home with ease. Enjoy a hassle-free experience with our seamless rental process.' }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                custom={index}
              >
                <Card className="text-center group hover:-translate-y-2 transition-all duration-300 border-0 bg-transparent">
                  <CardContent className="pt-6">
                    <div className="bg-gradient-to-br from-primary to-primary/60 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                      <item.icon className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{t(item.title)}</h3>
                    <p className="text-muted-foreground text-lg">
                      {t(item.desc)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </Layout>
  );
};

export default Home;