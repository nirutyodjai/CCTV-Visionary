import type { ProjectState, Building, Floor } from './types';

/**
 * Generates an empty project structure to start a new plan.
 * @returns An empty ProjectState object with one default building and floor.
 */
export function generateDemoProject(): ProjectState {

    const initialFloor: Floor = {
        id: 'floor_starter_1',
        name: 'ชั้น 1',
        floorPlanUrl: null,
        devices: [],
        connections: [],
        architecturalElements: [],
        diagnostics: [],
    };

    const initialBuilding: Building = {
        id: 'bld_starter_1',
        name: 'อาคาร 1',
        floors: [initialFloor],
    };

    const project: ProjectState = {
        projectName: 'โครงการใหม่',
        buildings: [initialBuilding],
        vlans: [],
        subnets: [],
    };

    return project;
}
