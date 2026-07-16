import { ElementType } from 'react';

export interface POI {
  id: string;
  type: string;
  title: string;
  category: string;
  icon: ElementType;
  x: number;
  y: number;
  latitude: number;
  longitude: number;
  distance: string;
  time: string;
  description: string;
  price: string;
  hours: string;
  contact?: string;
  image: string;
  video: string;
  images?: string[];
  packages?: TouristPackage[];
}

export interface TouristPackage {
  name: string;
  price: string;
  features: string[];
}