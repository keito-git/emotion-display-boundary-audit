// Transpile the frozen C-04 TypeScript with the tsconfig SHIPPED IN THE PACKAGE
// and the TypeScript version named in its devDependencies (3.8.3), then diff the
// emitted JS against the build/commonjs files that were actually executed.
const fs = require('fs');
const path = require('path');

// usage: node verify_C-04_transpile.cjs <frozen source dir> <isolated node env dir>
// Both typescript and face-api.js are resolved from the isolated node env that is
// passed in, so this script runs correctly from any directory.
const FRZ = process.argv[2];
const ENV = process.argv[3];
if (!FRZ || !ENV) {
  console.error('usage: node verify_C-04_transpile.cjs <frozen_source_dir> <nodeenv_dir>');
  process.exit(2);
}
const PKG = path.join(ENV, 'node_modules', 'face-api.js');
const ts = require(path.join(ENV, 'node_modules', 'typescript'));

const tsconfig = ts.parseConfigFileTextToJson('tsconfig.json',
  fs.readFileSync(path.join(PKG, 'tsconfig.json'), 'utf8'));
if (tsconfig.error) { console.error(tsconfig.error); process.exit(1); }
const opts = ts.convertCompilerOptionsFromJson(tsconfig.config.compilerOptions, PKG).options;
console.log('typescript', ts.version);
console.log('compilerOptions taken verbatim from the package tsconfig.json:');
console.log('  target=' + ts.ScriptTarget[opts.target] + ' module=' + ts.ModuleKind[opts.module] +
            ' removeComments=' + opts.removeComments + ' importHelpers=' + opts.importHelpers +
            ' sourceMap=' + opts.sourceMap + ' preserveConstEnums=' + opts.preserveConstEnums);

const pairs = [
  ['C-04__src_draw_drawFaceExpressions.ts',        'build/commonjs/draw/drawFaceExpressions.js',        'src/draw/drawFaceExpressions.ts'],
  ['C-04__src_faceExpressionNet_FaceExpressions.ts','build/commonjs/faceExpressionNet/FaceExpressions.js','src/faceExpressionNet/FaceExpressions.ts'],
  ['C-04__src_utils_index.ts',                     'build/commonjs/utils/index.js',                     'src/utils/index.ts'],
];

// The shipped files end with a `//# sourceMappingURL=<name>.js.map` line.
// transpileModule emits the same directive; normalise ONLY that one line so the
// comparison is about code, and report that this is what was normalised.
const strip = s => s.replace(/\r\n/g, '\n').replace(/\/\/# sourceMappingURL=.*\n?$/, '').replace(/\s+$/, '');

let allSame = true;
for (const [frozen, built, fakeName] of pairs) {
  const srcText = fs.readFileSync(path.join(FRZ, frozen), 'utf8');
  const out = ts.transpileModule(srcText, { compilerOptions: opts, fileName: fakeName }).outputText;
  const shipped = fs.readFileSync(path.join(PKG, built), 'utf8');
  const a = strip(out), b = strip(shipped);
  const same = a === b;
  allSame = allSame && same;
  console.log(`\n=== ${frozen}`);
  console.log(`    vs face-api.js@0.22.2 ${built}`);
  console.log(`    frozen sha256  : ${require('crypto').createHash('sha256').update(fs.readFileSync(path.join(FRZ, frozen))).digest('hex')}`);
  console.log(`    emitted JS len : ${a.length}   shipped JS len : ${b.length}`);
  console.log(`    IDENTICAL (after normalising only the sourceMappingURL line): ${same}`);
  if (!same) {
    const la = a.split('\n'), lb = b.split('\n');
    for (let i = 0; i < Math.max(la.length, lb.length); i++) {
      if (la[i] !== lb[i]) {
        console.log(`      first difference at line ${i + 1}:`);
        console.log(`        emitted: ${JSON.stringify(la[i])}`);
        console.log(`        shipped: ${JSON.stringify(lb[i])}`);
        break;
      }
    }
    fs.writeFileSync('/tmp/emitted_' + path.basename(built), a);
    fs.writeFileSync('/tmp/shipped_' + path.basename(built), b);
  }
}
console.log(`\nALL THREE FROZEN TS FILES REPRODUCE THE EXECUTED JS BYTE FOR BYTE: ${allSame}`);
