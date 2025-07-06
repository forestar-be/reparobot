import React from 'react';
import {
  Award,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  PhoneCall,
  Settings,
  Shield,
  Star,
  Truck,
  Wrench,
  Zap,
} from 'lucide-react';

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

const iconMap = {
  settings: Settings,
  wrench: Wrench,
  shield: Shield,
  truck: Truck,
  calendar: Calendar,
  phone: PhoneCall,
  map: MapPin,
  clock: Clock,
  award: Award,
  check: CheckCircle,
  star: Star,
  zap: Zap,
};

const Icon: React.FC<IconProps> = ({ name, className = '', size = 24 }) => {
  const IconComponent = iconMap[name as keyof typeof iconMap];

  if (!IconComponent) {
    return null;
  }

  return <IconComponent className={className} size={size} />;
};

export default Icon;
