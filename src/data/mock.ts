import { Project } from '../types';

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: '美妆测评号',
    nature: '个人 IP',
    positioning: '高性价比彩妆测评，主打学生党和职场新人',
    shortTermGoal: '3个月内涨粉 1w，单篇笔记互动过 500',
    vision: '成为最具公信力的平价美妆种草指南',
    tasks: [
      { id: 't1', title: '夏季控油散粉测评', status: 'draft', lastModified: '2023-06-15' },
      { id: 't2', title: '50元以内口红推荐', status: 'published', lastModified: '2023-06-10' },
      { id: 't3', title: '新手化妆刷怎么选', status: 'published', lastModified: '2023-06-05' },
    ]
  },
  {
    id: 'p2',
    name: '周末去哪儿',
    nature: '本地生活',
    positioning: '发现城市小众打卡地，主打周末短途游',
    shortTermGoal: '建立 5 个活跃粉丝群',
    vision: '打造本地最全的周末游玩攻略库',
    tasks: [
      { id: 't4', title: '城郊露营地探店', status: 'draft', lastModified: '2023-06-16' },
      { id: 't5', title: '复古咖啡馆探秘', status: 'published', lastModified: '2023-06-12' },
    ]
  },
  {
    id: 'p3',
    name: '极简穿搭',
    nature: '时尚穿搭',
    positioning: '优衣库/ZARA 穿出高级感，主打极简风',
    shortTermGoal: '签约 3 个品牌合作',
    vision: '引领普通人的极简时尚美学',
    tasks: []
  }
];
