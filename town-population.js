import {addRoyalGuards,ROYAL_GUARD_COUNT} from './royal-guard.js';
import {addNewcomers} from './newcomers.js';
import {createPopulation,nodes,random} from './simulation.js';
import {addFeaturedResidents} from './featured-residents.js';
export const TOWN_POPULATION=200+ROYAL_GUARD_COUNT;
export function createTownPopulation(){return addRoyalGuards(addNewcomers(addFeaturedResidents(createPopulation(200-24-9),nodes,random)));}
