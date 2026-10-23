import {execFileSync} from 'node:child_process';
import {root} from './snapshot.mjs';
import {loadContent} from './content.mjs';
const baseline='744a0205ebf3a7448ea2aa41626181d087decfce';
try {
 // Compare tracked original content without exporting names, metadata or hashes.
 execFileSync('git',['cat-file','-e',`${baseline}^{commit}`],{cwd:root,stdio:'ignore'});
 execFileSync('git',['diff','--quiet',baseline,'--','.',':(exclude)cloudflare'],{cwd:root,stdio:'ignore'});
} catch {
 throw new Error('Original tracked source differs from baseline or baseline is unavailable. Restore/fetch the baseline and review locally; do not publish private inventories.');
}
console.log('Original tracked source matches the baseline commit. Full database completeness remains unverified.');
const {posts}=await loadContent();console.log(`Verified ${posts.length} bounded published article files and aggregate checksum.`);
