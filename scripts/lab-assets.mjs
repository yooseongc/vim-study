import { mkdir, writeFile } from 'node:fs/promises';
import { labArchiveFiles } from '../src/lessons/local-lab.js';

// Uncompressed ZIP: small text fixtures, deterministic metadata, no runtime dependency.
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}
export async function buildLabArchive() {
  await mkdir('public', { recursive: true });
  const entries = [],
    directory = [];
  let offset = 0;
  for (const [path, text] of Object.entries(labArchiveFiles())) {
    const name = Buffer.from(`vim-study-lab/${path}`),
      data = Buffer.from(text);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(0x800, 6);
    header.writeUInt16LE(33, 12); // 1980-01-01
    header.writeUInt32LE(crc32(data), 14);
    header.writeUInt32LE(data.length, 18);
    header.writeUInt32LE(data.length, 22);
    header.writeUInt16LE(name.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    header.copy(central, 6, 4, 30);
    central.writeUInt32LE(offset, 42);
    entries.push(header, name, data);
    directory.push(central, name);
    offset += header.length + name.length + data.length;
  }
  const index = Buffer.concat(directory),
    end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(directory.length / 2, 8);
  end.writeUInt16LE(directory.length / 2, 10);
  end.writeUInt32LE(index.length, 12);
  end.writeUInt32LE(offset, 16);
  await writeFile('public/vim-study-lab.zip', Buffer.concat([...entries, index, end]));
}
