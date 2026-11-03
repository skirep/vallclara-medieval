import {addNewcomers} from './newcomers.js';
import {createPopulation,nodes,random} from './simulation.js';
import {addFeaturedResidents} from './featured-residents.js';
export const TOWN_POPULATION=200;
export function createTownPopulation(){return addNewcomers(addFeaturedResidents(createPopulation(TOWN_POPULATION-24-9),nodes,random));}
