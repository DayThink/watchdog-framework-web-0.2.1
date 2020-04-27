<template>
    <div>
      <!-- 查看某个订单的详情信息  -->
      <Modal v-model="info.seen" title="订单详情" :loading="loading" :mask-closable="false" :width="850" :closable="false">
<!--        {{this.info}}-->
        <Form ref="display">
          <FormItem label="订单编号:" style="display: inline-flex; margin-right: 5px">
            <Input v-model="info.orderNo" disabled type="text" style="width: 120px"/>
          </FormItem>
          <FormItem label="操作人:" style="display: inline-flex; margin-left: 10px">
            <Input v-model="info.userName" disabled type="text" style="width: 150px"/>
          </FormItem>
          <FormItem label="供货商:" style="display: inline-flex; margin-left: 10px">
            <Select v-model="seleted_supplier" disabled style="width:250px" clearable filterable>
              <Option v-for="item in suppliers" :value="item.code" :key="item.code">{{ item.name }}</Option>
            </Select>
          </FormItem>
          <FormItem v-for="(item, idx) in content" :value=item.id :key=item.id label="条目" style="height: 15px">
            {{item.id}}
            <Select v-model="item.first_level" disabled style="width:150px" clearable filterable>
              <Option v-for="k in categorys[0]" :value="k.code" :key="k.code">{{ k.cnName }}-{{ k.enName }}</Option>
            </Select>
            <Select v-model="item.sec_level" disabled style="width:150px; margin-left: 5px" clearable filterable>
              <Option v-for="sec in categorys[item.first_level]" :value="sec.code" :key="sec.code">{{ sec.cnName }}-{{ sec.enName }}</Option>
            </Select>
            <label style="margin-left: 10px">重量(市斤):</label>
            <InputNumber v-model="item.weight" disabled type="text" style="width: 100px"/>
            <label style="margin-left: 10px">单价(元/市斤):</label>
            <InputNumber v-model="item.price" disabled type="text" style="width: 100px"/>

          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="info" :disabled="loading" @click="cancel(false)">确定</Button>
          <Button type="success" :disabled="loading" @click="print">打印</Button>
        </div>
      </Modal>
    </div>
</template>

<script>
import { post } from '@/libs/axios-cfg'
import baseData from '@/libs/constants.js'
export default {
  name: "display",
  props:{
    info:{
      type:Object
    }
  },
  data(){
      return {
        loading: false,
        name: '',
        content: [],
        categorys: [],
        seleted_supplier: '',
        suppliers: baseData.suppliers,
      }
  },
  methods:{
    print() {
      window.print();
    },
    cancel(up=false){
      this.$emit('cancel', up);
      this.info.seen = false;
    },
    /**
     * @description 获取仓库全部的货物类别category
     */
    async all_category () {
      try {
        let res = await post('/system/category/list', {});
        this.categorys = res.data[1];
      } catch (error) {
        this.$throw(error)
      }
    },
  },
  mounted(){
    this.all_category();
    this.content = JSON.parse(this.info.content);
    this.suppliers.forEach(item => {
      if (item.name === this.info.supplier) {
        this.seleted_supplier = item.code;
      }
    })
  }
}
</script>

<style scoped>

</style>
