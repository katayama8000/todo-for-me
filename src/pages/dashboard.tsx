import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import Link from "next/link";
import { TextInput, Button, Group, Box, NumberInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { config } from "@config/supabase/supabase";
import { YouTube } from "@components/layout/YouTube";
import { makeNotification } from "@function/makeNotification";

type links = {
  link1?: string;
  link2?: string;
  link3?: string;
};

//DBのデータの持ち方を変更したい

const makeLink = (link: string) => {
  const result = link.split("=");
  return `https://www.youtube.com/embed/${result[1]}`;
};

const makeOrignalLink = (link: string) => {
  const result = link.split("embed/");
  return `https://www.youtube.com/watch?v=${result[1]}`;
};

const linkform: NextPage = () => {
  const [links, setLinks] = useState<links>();
  const [time, setTime] = useState<number>(0);
  const form = useForm({
    initialValues: {
      link1: "",
      link2: "",
      link3: "",
    },
  });

  const handleSubmit = async (values: {
    link1: string;
    link2: string;
    link3: string;
  }) => {
    if (values.link1 === "" && values.link2 === "" && values.link3 === "") {
      makeNotification("はい？", "何か入力して", "red");
      return;
    } else {
      if (values.link1 === "") {
        values.link1 = makeOrignalLink(links?.link1!);
      }
      if (values.link2 === "") {
        values.link2 = makeOrignalLink(links?.link2!);
      }
      if (values.link3 === "") {
        values.link3 = makeOrignalLink(links?.link3!);
      }
    }

    const { data, error } = await config.supabase.from("Links").upsert([
      {
        id: 0,
        link1: values.link1,
        link2: values.link2,
        link3: values.link3,
      },
    ]);
    if (data) {
      makeNotification("成功", "これ見てやる気を出せ！", "indigo");
    } else if (error) {
      makeNotification("失敗", "再度入力して", "red");
    }
    form.reset();
  };

  useEffect(() => {
    config.supabase
      .from("Links")
      .on("*", (payload) => {
        const l1 = makeLink(payload.new.link1);
        const l2 = makeLink(payload.new.link2);
        const l3 = makeLink(payload.new.link3);
        setLinks({ link1: l1, link2: l2, link3: l3 });
      })
      .subscribe();
    get();
  }, []);

  const setClock = async () => {
    const { data, error } = await config.supabase.from("Links").upsert([
      {
        id: 0,
        time: time,
      },
    ]);
    makeNotification("成功", "開始時間を決めたよ", "indigo");
  };

  const get = async () => {
    const { data, error } = await config.supabase.from("Links").select();
    if (error) {
      makeNotification("失敗", "再度試して", "red");
    }
    if (data) {
      const l1 = makeLink(data[0].link1);
      const l2 = makeLink(data[0].link2);
      const l3 = makeLink(data[0].link3);
      setTime(data[0].time);
      setLinks({ link1: l1, link2: l2, link3: l3 });
    }
  };

  return (
    <div>
      <Box sx={{ maxWidth: 300 }} mx="auto">
        <Link href="/">
          <a>←</a>
        </Link>
        <h3>見るとやる気の起きる動画を保存</h3>
        <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
          <TextInput
            placeholder="https://www.youtube.com/"
            {...form.getInputProps("link1")}
            className="py-2"
          />
          <TextInput
            placeholder="https://www.youtube.com/"
            {...form.getInputProps("link2")}
            className="py-2"
          />
          <TextInput
            placeholder="https://www.youtube.com/"
            {...form.getInputProps("link3")}
            className="py-2"
          />
          <Group position="right" mt="md">
            <Button type="submit" color="indigo">
              動画を保存
            </Button>
          </Group>
        </form>
        <h3>動画であおる時間を指定</h3>
        <NumberInput
          label="終わりは24時"
          placeholder="15時から23時まで"
          max={23}
          min={15}
          value={time}
          onChange={(val) => setTime(val!)}
        />
        <Group position="right" mt="md">
          <Button color="indigo" onClick={setClock}>
            時間を保存
          </Button>
        </Group>
      </Box>
      <div className="flex-center flex pt-4">
        <YouTube link={links?.link1} width={224} height={126} />
        <YouTube link={links?.link2} width={224} height={126} />
        <YouTube link={links?.link3} width={224} height={126} />
      </div>
    </div>
  );
};

export default linkform;
