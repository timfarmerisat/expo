import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const backend=read('backend/app.ts');
const data=read('src/data.ts');
const tests=JSON.parse(read('tests/tests.json'));
const failures=[];
const requireText=(name,text,needle)=>{if(!text.includes(needle))failures.push(name+': missing '+needle)};
requireText('auth',backend,"requireAuth()");
requireText('owner allowlist',backend,"requireAdminEmailAllowlist(ADMIN_EMAILS)");
requireText('readiness',backend,"GET /api/readiness");
requireText('release identity',backend,"vf-hardening-2026-09-17");
requireText('research URL guard',backend,"isSafePublicUrl");
requireText('upload allowlist',backend,"ALLOWED_FILE_TYPES");
requireText('decoded upload size',backend,"decodedBase64Bytes");
requireText('file quota',backend,"File vault limit reached");
if(/name: 'GitHub', status: 'Connected'/.test(data)) failures.push('provider truth: GitHub must not be Connected without runtime verification');
if(!Array.isArray(tests)||tests.length<3||tests.length>5) failures.push('qa: tests/tests.json must contain 3-5 tests');
if(tests.filter((t)=>t.sanity===true).length!==1) failures.push('qa: exactly one sanity test is required');
for(const [i,t] of tests.entries()){for(const key of ['name','viewport','covers','description','steps','expected']){if(!t[key]||(Array.isArray(t[key])&&!t[key].length))failures.push('qa test '+(i+1)+': missing '+key)}}
const secretPattern=/(sk-[A-Za-z0-9]{20,}|AIza[0-9A-Za-z_-]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/;
for(const file of ['backend/app.ts','src/data.ts','src/VioletForge.tsx']){if(secretPattern.test(read(file)))failures.push('secret scan: probable secret in '+file)}
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log('Violet Forge validation passed: auth, owner gate, readiness, URL guard, storage controls, provider truth, QA schema, and secret scan.');
