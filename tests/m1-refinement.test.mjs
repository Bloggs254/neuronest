import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
const text=s=>s.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
test('visual refinement retains all three prices and exact package limitations',()=>{
  const packages=[...html.matchAll(/<article class="package(?: package-featured)?">([\s\S]*?)<\/article>/g)].map(m=>m[1]);
  assert.equal(packages.length,3);
  const expected=[
    ['35,000',['Five core pages','Layouts designed for phones','Contact handoff, subject to channel verification','Google Business Profile setup with supplied assets']],
    ['65,000',['Seven pages, including two service pages','Copy for three pages','Booking or quote form, subject to tested delivery','First-month snapshot, subject to analytics approval']],
    ['95,000',['Ten pages','Catalogue with up to 50 product entries; no cart','English and Kiswahili homepage','Branch and staff contact information']]
  ];
  packages.forEach((p,i)=>{assert.ok(text(p).includes(expected[i][0]));assert.deepEqual([...p.matchAll(/<li>(.*?)<\/li>/g)].map(m=>text(m[1])),expected[i][1]);});
  assert.match(html,/Timelines, ongoing support and commercial terms are confirmed in a written proposal/);
  assert.match(html,/Final scope and quotation/);
  assert.doesNotMatch(html,/Most popular|Best seller|Guaranteed|Save \d+%/i);
});
test('portfolio enlargement is a local genuine screenshot, not a demo or new capability',()=>{
  assert.match(html,/class="work-card work-flagship"/);
  const imageLink=/<a class="work-image"([^>]*)>/.exec(html)?.[1];
  assert.match(imageLink,/href="assets\/projects\/openduka-preview.webp"/);
  assert.match(imageLink,/target="_blank" rel="noopener noreferrer"/);
  assert.match(html,/Genuine product screenshot. Fictional sample data/);
  assert.match(html,/In development/);
  assert.match(html,/Concept, not a client project/);
  assert.match(html,/does not take payments or fulfil orders/);
});
