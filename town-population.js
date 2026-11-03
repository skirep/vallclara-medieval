import {createPopulation,nodes,random} from './simulation.js';
import {addFeaturedResidents} from './featured-residents.js';
export const TOWN_POPULATION=200;
export function createTownPopulation(){return addFeaturedResidents(createPopulation(TOWN_POPULATION-24),nodes,random);}
