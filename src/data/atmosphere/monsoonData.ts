export interface MonsoonFlow {
  id: string;
  name: string;
  region: string;
  season: 'summer' | 'winter';
  windDirection: string;
  origin: string;
  description: string;
  path: [number, number][];
}

export const MONSOON_FLOWS: MonsoonFlow[] = [
  {
    id: 'east-asia-summer',
    name: '东亚夏季风',
    region: '东亚',
    season: 'summer',
    windDirection: '东南风',
    origin: '太平洋',
    description: '夏季北太平洋副热带高压增强，暖湿气流以东南风吹向亚洲东南岸',
    path: [
      [20, 130], [25, 125], [30, 120], [35, 115], [40, 115],
    ],
  },
  {
    id: 'east-asia-winter',
    name: '东亚冬季风',
    region: '东亚',
    season: 'winter',
    windDirection: '西北风',
    origin: '西伯利亚',
    description: '冬季亚洲高压与太平洋低压之间形成干燥寒冷的西北风',
    path: [
      [50, 100], [45, 105], [40, 110], [35, 115], [30, 120], [25, 125],
    ],
  },
  {
    id: 'south-asia-summer',
    name: '南亚夏季风',
    region: '南亚',
    season: 'summer',
    windDirection: '西南风',
    origin: '印度洋',
    description: '南半球东南信风北移越过赤道，在地转偏向力作用下向右偏转形成西南季风',
    path: [
      [-10, 80], [0, 85], [10, 80], [20, 75], [25, 80],
    ],
  },
  {
    id: 'south-asia-winter',
    name: '南亚冬季风',
    region: '南亚',
    season: 'winter',
    windDirection: '东北风',
    origin: '亚洲大陆',
    description: '冬季亚洲大陆冷高压，风从陆地吹向海洋',
    path: [
      [30, 80], [25, 85], [20, 90], [15, 90], [10, 95],
    ],
  },
];
