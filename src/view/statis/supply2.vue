<template>
  <Table :columns="columns" height="200" :data="newData" border :span-method="handleSpan"></Table>
</template>
<script>
  export default {
    data () {
      return {
        columns: [
          {
            title: 'Age',
            key: 'age'
          },
          {
            title: 'Date',
            key: 'date'
          },
          {
            title: 'Name',
            key: 'name'
          },
          {
            title: 'Address',
            key: 'address'
          }
        ],
        data: [
          {
            name: 'John Brown',
            age: '18',
            address: 'New York No. 1 Lake Park',
            date: '2016-10-03'
          },
          {
            name: 'Jim Green',
            age: '18',
            address: 'London No. 1 Lake Park',
            date: '2016-10-01'
          },
          {
            name: 'Jim Green',
            age: '24',
            address: 'London No. 1 Lake Park',
            date: '2016-10-01'
          },
          {
            name: 'Joe Black',
            age: '24a',
            address: 'Sydney No. 1 Lake Park',
            date: '2016-10-02'
          },
          {
            name: 'Jon Snow',
            age: '30',
            address: 'Ottawa No. 2 Lake Park',
            date: '2016-10-04'
          },
          {
            name: 'Jon Snow',
            age: '30',
            address: 'Ottawa No. 2 Lake Park',
            date: '2016-10-04'
          }
        ],
        newData: []
      }
    },
    created() {
      let that = this;
      that.newData = that.integratedData(that.data);
    },
    methods: {
      // 被整理的数组中相同age的元素需放在一块，否则还要再整理数据（暂未处理）
      integratedData(data) {
        let that = this;
        let arrId = [];
        data.forEach(i => {
          !arrId.includes(i.age) ? arrId.push(i.age) : arrId;
        });
        let arrObj = [];
        arrId.forEach(j => {
          arrObj.push({
            id: j,
            num: 0
          })
        })
        data.forEach(k => {
          arrObj.forEach(l => {
            k.age === l.id ? l.num ++ : l.num;
          })
        })
        data.forEach(m => {
          arrObj.forEach(n => {
            if(m.age === n.id){
              if(arrId.includes(m.age)){
                m.mergeCol = n.num;

                let idx = arrId.indexOf(m.age);
                let aa = arrId.splice(idx, 1);

                // arrId.splice([],1);
                // arrId.splice(arrId.splice(m.age),1);
              }else{
                m.mergeCol = 0;
              }
            }
          })
        })
        return data;
      },
      // 只针对相同age字段合并列，age位于第一列，columnIndex为0
      handleSpan ({ row, column, rowIndex, columnIndex }) {
        if (columnIndex === 0) {
          return {
            rowspan: row.mergeCol === 0 ? 0:row.mergeCol,
            colspan: row.mergeCol === 0 ? 0:1
          };
        }
      }
    }
  }
</script>
