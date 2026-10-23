// Public build utilities only. Private source inventories are never generated here.
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
export const root=resolve(import.meta.dirname,'../..');
export const sha=s=>createHash('sha256').update(s).digest('hex');
