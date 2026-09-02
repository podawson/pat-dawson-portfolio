import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const manifestPath = path.join(root, "content/hyperstructures-tokens.json");
const outputDir = path.join(root, "public/work/gallery/hyperstructures/surfaces");
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
const query = `query SurfaceTokens($creator: String!) {
  token(where: { creators: { creator_address: { _eq: $creator } }, name: { _like: "Surface%" } }) {
    token_id name display_uri fa_contract
  }
}`;
const response = await fetch("https://data.objkt.com/v3/graphql", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ query, variables: { creator: manifest.creator } }),
});
if (!response.ok) throw new Error(`Objkt API returned ${response.status}`);
const payload = await response.json();
if (payload.errors?.length) throw new Error(payload.errors.map((error) => error.message).join("\n"));

const remote = new Map(payload.data.token.map((token) => [`${token.fa_contract}:${token.token_id}`, token]));
for (const token of manifest.tokens) {
  const record = remote.get(`${manifest.contract}:${token.tokenId}`);
  if (!record) throw new Error(`Missing Objkt token ${token.tokenId}`);
  if (record.name !== token.name) throw new Error(`Token ${token.tokenId} is ${record.name}, not ${token.name}`);
  if (record.display_uri !== token.displayUri) throw new Error(`Display URI drift for ${token.name}`);
}

if (process.argv.includes("--download")) {
  await fs.mkdir(outputDir, { recursive: true });
  for (const token of manifest.tokens.filter(({ placement }) => placement !== "hero" && placement !== "facts")) {
    const cid = token.displayUri.replace("ipfs://", "");
    const imageResponse = await fetch(`https://nftstorage.link/ipfs/${cid}`);
    if (!imageResponse.ok) throw new Error(`Could not download ${token.name}: ${imageResponse.status}`);
    const source = Buffer.from(await imageResponse.arrayBuffer());
    await sharp(source).resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).webp({ quality: 90 }).toFile(path.join(outputDir, token.file));
  }
}

console.log(`Validated ${manifest.tokens.length} exact Objkt token links${process.argv.includes("--download") ? " and refreshed image assets" : ""}.`);
