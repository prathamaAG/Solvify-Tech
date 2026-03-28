import { OrgChart } from "d3-org-chart";
import React, { useEffect, useRef } from "react";
export default function OrgTree({ data }) {
  const chartRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    if (!data || !containerRef.current) return;

    const chart = new OrgChart()
      .container(containerRef.current)
      .data(data)
      .compact(false)
      .render()
      .fit()
      .nodeWidth((d) => 250)
      .nodeHeight((d) => 150)
      .nodeContent((d) => {
        const color = d.data.isTerminated ? "#f5f5f5" : "#f3f1f1";
        const imageDiffVert = 25 + 2;
        const opacityValue = (d.data.isTerminated || d.data.isInactive) ? 0.4 : 1;
        return `
          <div style='width:${d.width}px; height:${d.height}px; padding-top:${imageDiffVert - 2
          }px; padding-left:1px; padding-right:1px; opacity: ${opacityValue};'>
            <div style="font-family: 'Inter', sans-serif; background-color:${color};   margin-left:-1px; width:${d.width - 2
              }px; height:${d.height - imageDiffVert}px; border-radius:10px; border: 1px solid #E4E2E9">
                <div style="display:flex; justify-content:flex-end; margin-top:5px; margin-right:8px">
                  #${d.data?.id}
                </div>
                <div style="background-color:${color}; margin-top:${-imageDiffVert - 20
                }px; margin-left:${15}px; box-shadow: 0px 0px 7px -4px; border-radius:100px; width:50px; height:50px; " ></div>
                  <div style="margin-top:${-imageDiffVert - 20}px; ">   
                    <img src="${d.data.imageUrl}" style="margin-left:${20}px;  margin-top: 2px;  border-radius:100px;  width:40px;  height:40px;  object-fit: cover; " />
                  </div>
                  <div style="font-size:15px; color:#08011E; margin-left:20px; margin-top:10px">  
                  ${d.data.name} </div>
                  <div style="color:#716E7B; margin-left:20px; margin-top:3px; font-size:9px; "> ${d.data.position
                  } </div>
                  <div style="color:#716E7B; margin-left:20px; margin-top:3px; font-size:10px; "> ${d?.data?.department
                  } </div>
            </div>
          </div>
        `;
      });

    chart.render();
    chartRef.current = chart;

    const rootNode = data[0];
    if (rootNode && rootNode.children) {
      rootNode.children.forEach((child) => {
        chart.setExpanded(child.id, true);
      });
      chart.render();
    }

    return () => {
      if (chartRef.current) {
        chartRef.current = null;
      }
    };
  }, [data]);

  return (
    <div ref={containerRef} style={{ height: "100%", width: "100%" }}></div>
  );
}