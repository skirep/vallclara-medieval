import {addNinjas,NINJA_COUNT} from './ninja-actors.js';
import {addRoyalGuards,ROYAL_GUARD_COUNT} from './royal-guard.js';
import {addNewcomers} from './newcomers.js';
import {createPopulation,nodes,random} from './simulation.js';
import {addFeaturedResidents} from './featured-residents.js';
export const TOWN_POPULATION=100;
export function createTownPopulation(){return addNinjas(addRoyalGuards(addNewcomers(addFeaturedResidents(createPopulation(TOWN_POPULATION-ROYAL_GUARD_COUNT-24-9-NINJA_COUNT),nodes,random))));}
