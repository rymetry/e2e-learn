// 第 00 章「自分の言葉で書き直す」の解答例。自分で書いてから見ること。
const user = { name: 'alice', plan: 'Free' };
const { name, plan } = user;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  await wait(300);
  await wait(300);
  console.log(`${name} is on the ${plan} plan`);
}

await main();
