<template>
    <Modal v-model="info.seen" title="出库单详情" :loading="loading" :mask-closable="false" :width="910" :styles="{top: '20px'}" :closable="false">
<!--      {{this.info}}-->
      <Table @on-selection-change="selectItems" @on-select-all="selectItems"
             :columns="table.columns" :data="table.data" :height="500" :loading="table.loading" stripe border />
      <div slot="footer">
        <Button type="info" :disabled="loading" @click="cancel(false)">取消</Button>
        <Button type="warning" :disabled="loading" @click="save(false)">保存</Button>
      </div>
    </Modal>
</template>

<script>
import { post } from '@/libs/axios-cfg'
import { formatDate } from '@/libs/util'
export default {
  name: "out_order",
  props:{
    info:{
      type:Object
    }
  },
  data () {
    return {
      loading: false,
      used_hash: {},
      selected: {},
      table: {
        loading: false,
        data: [],
        columns: [
          {
            type: 'selection',
            width: 40,
            align: 'center',
          },
          {
            title: '编码',
            key: 'code',
            width: 80,
            align: 'center'
          },
          {
            title: '名称',
            key: 'cnName',
            width: 150,
            align: 'center'
          },
          {
            title: '拼音',
            key: 'enName',
            width: 150,
            align: 'center'
          },
          {
            title: '当前库存量(市斤)',
            key: 'weight',
            width: 150,
            align: 'center'
          },
          {
            title: '选取使用量(市斤)',
            width: 300,
            align: 'center',
            render:(h, params) => {
              return h('InputNumber', {
                props: {
                  value: params.row.weight,
                  size: 'small',
                  max: params.row.weight,
                },
                style: {
                  width: '120px'
                },
                on: {
                  'on-change': (val) => {
                    console.log('val=' + val);
                    params.row.used = val;
                    this.used_hash[params.row.code] = params.row;
                  }
                },
              })
            }// end render
          }
        ],
      }
    }
  },
  methods: {
    // 查询全部库存，并从库存中选择所需
    async list_store () {
      try {
        let res = await post('/store/in/list', {
          page: 1,
          pageSize: 10000
        });
        // console.log(res);
        this.table.data = res.data.records;
      } catch (error) {
        this.$throw(error)
      }
    },
    selectItems(sel) {
      this.selected = {};
      sel.forEach(item =>{
        this.selected[item.code] = item;
      });
      // console.log(this.selected);
    },
    async save () {
      for (let key in this.selected) {
        if (this.used_hash[key]) {
          this.selected[key] = this.used_hash[key];
        } else {
          this.selected[key].used = this.selected[key].weight;
        }
      }
      // console.log(this.selected);

      var outTradeNo="";  //订单号
      for(var i=0;i<3;i++) {//6位随机数，用以加在时间戳后面
        outTradeNo += Math.floor(Math.random()*10);
      }
      outTradeNo = formatDate(new Date(), 'yyyyMMdd') + outTradeNo;
      try {
        let res = await post('/store/out/add', {
          outNo: outTradeNo,
          userName: localStorage.getItem('account'),
          content: JSON.stringify(this.selected),
        });
        this.$emit('addchg', res);
      } catch (error) {
        this.$throw(error)
      }
      this.info.seen = false;
      this.selected = {};
    },
    cancel(up=false){
      this.$emit('cancel', up);
    },
  },
  mounted() {
    this.used_hash = {};
    this.list_store();
  },
  watch: {
    'info.seen' (value) {
      if (value) {
        // console.log('watch =' + value);
        this.list_store();
        this.table.data.forEach(item => {
          item._checked = false;
          item.used = item.weight;
        })
      }
    },
  }
}
</script>

<style scoped>

</style>
